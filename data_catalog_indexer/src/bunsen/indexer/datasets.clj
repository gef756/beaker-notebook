(ns bunsen.indexer.datasets
  (:require [bunsen.indexer.base :as base]
            [clj-http.client :as http]
            ))

(defn extract-datasets
  "Given a feed result page json, extracts the datasets"
  [json-body]
  (-> json-body :payload first :actual))

(defn es-dataset-doc
  "Given one dataset from the feed, and the collection of categories, returns the Elastiche payload for the category"
  [categories dataset]
  (let [cat-id (dataset :categoryId)
        source-category (categories (str cat-id))]
    {:_id (:id dataset)
     :title (:product dataset)
     :vendor (:vendor dataset)
     :categories [{:id cat-id
                   :name (:name source-category)
                   :path (:path source-category)}]
     :lastUpdated (:activeAgo dataset)
     :metaDataChanged (:lastUpdateTime dataset)
     :remoteFile (:storage dataset)
     :createdAt (:firstUpdateTime dataset)
     :id (:id dataset)
     :description (:description dataset)
     :businessOwner (:businessOwner dataset)
     :public (:public dataset)}))

(defn parse-feed-page
  "Given the raw response from TS feed, parses it"
  [categories json-body]
  [:more (:more json-body)
   :result (map (partial es-dataset-doc categories) (extract-datasets json-body))])

(defn source-page-url
  "Constructs the full url for a source dataset page from base and params"
  [base page-number since]
  (str base "?page=" page-number "&since=" since))

(defn index-datasets!
  "Given an elasticsearch connection, base url category map and index name, index all datasets"
  [es-conn index-name base-url categories]
  (loop [page-number 1]
    (let [page-url (source-page-url base-url page-number 0)
          indexer (base/index! es-conn index-name "datasets"
                               (partial http/get page-url)
                               (partial base/parse-json-from-http
                                        (partial parse-feed-page categories))
                               base/bulk-to-es!)]
      (await-for 5000 indexer)
      (if (:more @indexer)
        (recur (+ page-number 1))
        indexer))))
