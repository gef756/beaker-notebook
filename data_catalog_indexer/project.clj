(defproject indexer "0.1.0-SNAPSHOT"
  :description "I index the TwoSigma dataset metadata."
  :resource-paths ["resources"]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/data.json "0.2.5"]
                 [com.taoensso/timbre "3.3.0"]
                 [clojurewerkz/elastisch "2.1.0-beta6"]
                 [clj-http "1.0.0"]
                 [com.taoensso/timbre "3.3.0"]])
