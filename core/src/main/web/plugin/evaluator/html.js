/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * HTML eval plugin
 * For creating and config evaluators that evaluate HTML code and update code cell results.
 */
define(function(require, exports, module) {
  'use strict';
  var PLUGIN_NAME = "Html";
  var Html = {
    pluginName: PLUGIN_NAME,
    cmMode: "htmlmixed",
    bgColor: "#E3502B",
    fgColor: "#FFFFFF",
    borderColor: "",
    shortName: "Ht",
    evaluate: function(code, modelOutput) {
      var startTime = new Date().getTime();
      return bkHelper.fcall(function() {
        var beaker = bkHelper.getNotebookModel().namespace; // this is visible to JS code in cell
        if (undefined === beaker) {
          bkHelper.getNotebookModel().namespace = {};
        }
        
        var precode = "<script>\n"+
        "var beaker = bkHelper.getNotebookModel().namespace;\n"+
        "beaker.showProgressUpdate = function (a,b,c) { };\n"+
        "beaker.showStatus = bkHelper.showStatus;\n"+
        "beaker.clearStatus = bkHelper.clearStatus;\n"+
        "beaker.showTransientStatus = bkHelper.showTransientStatus;\n"+
        "beaker.getEvaluators = bkHelper.getEvaluators;\n"+
        "beaker.getCodeCells = bkHelper.getCodeCells;\n"+
        "beaker.setCodeCellBody = bkHelper.setCodeCellBody;\n"+
        "beaker.setCodeCellEvaluator = bkHelper.setCodeCellEvaluator;\n"+
        "beaker.setCodeCellTags = bkHelper.setCodeCellTags;\n"+
        "beaker.evaluate = bkHelper.evaluate;\n"+
        "beaker.evaluateCode = bkHelper.evaluateCode;\n"+
        "beaker.loadJS = bkHelper.loadJS;\n"+
        "beaker.loadList = bkHelper.loadList;\n"+
        "beaker.httpGet = bkHelper.httpGet;\n"+
        "beaker.httpPost = bkHelper.httpPost;\n"+
        "beaker.newDeferred = bkHelper.newDeferred;\n"+
        "beaker.newPromise = bkHelper.newPromise;\n"+
        "beaker.all = bkHelper.all;\n"+
        "beaker.timeout = bkHelper.timeout;\n"+
        "</script>\n";
        
        modelOutput.result = {
          type: "BeakerDisplay",
          innertype: "Html",
          object: precode+code};
        modelOutput.elapsedTime = new Date().getTime() - startTime;
      });
    },
    spec: {
    }
  };
  var Html0 = function(settings) {
    if (!settings.view) {
      settings.view = {};
    }
    if (!settings.view.cm) {
      settings.view.cm = {};
    }
    settings.view.cm.mode = Html.cmMode;
    this.settings = settings;
  };
  Html0.prototype = Html;

  exports.getEvaluatorFactory = function() {
    return bkHelper.getEvaluatorFactory(bkHelper.newPromise(Html0));
  };
  exports.name = PLUGIN_NAME;
});
