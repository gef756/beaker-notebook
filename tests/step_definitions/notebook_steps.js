var _         = require("lodash");
var Promise   = require("bluebird");
var assert    = require("assert");
var $         = require('selenium-webdriver').promise;

var notebookBase = function() {
  return require("../fixtures/notebook_data_sample");
}

module.exports = function() {
  this.When(/^I go back to the project$/, function(notebookName) {
    return new this.Widgets.Notebook().goBackToProject();
  });

  this.When(/^I view the notebook list$/, function(notebookName) {
    return new this.Widgets.Notebook().goBackToProject();
  });

  this.When(/^I view the notebook "([^"]*)"$/, function(notebookName) {
    var notebookList = new this.Widgets.NotebookList();
    return Promise.delay(1500)
    .then(function() {
      return notebookList.clickByName(notebookName);
    })
  });

  this.Then(/^I (?:should see|see) the following recent notebooks:$/, function(table) {
    var recentNotebooks = new this.Widgets.RecentNotebooks();

    return recentNotebooks.getNames().then(function(recent) {
      return assert.deepEqual(recent, table.hashes().map(function(n) {
        return n.name;
      }));
    });
  });

  this.Given(/^I have the following notebooks:$/, function(notebooks) {
    var _this = this;

    return Promise.map(notebooks.hashes(), function(attrs) {
      attrs.userEmail = attrs.userEmail || "u@r.edu";

      return Promise.all([
        _this.seed.fetch("User", {email: attrs.userEmail}),
        _this.seed.fetch("Project", {name: attrs.projectName})
      ]).spread(function(user, project) {
        return _this.seed.populate({
          model: "Notebook",
          data: _.extend(
            notebookBase(),
            _.omit(attrs, ['userEmail', 'projectName']),
            {
              userId: JSON.parse(user[1]).id,
              projectId: JSON.parse(project[1]).id
            }
          )
        });
      });
    });
  });

  this.Then(/^the "([^"]*)" notebook is open$/, function(name) {
    // used from the notebook list page
    return new this.Widgets.NotebookList().clickByName(name)
    .then(function() {
      return new this.Widgets.Notebook().goBackToProject();
    }.bind(this))
    .then(function() {
      return Promise.delay(1500);
    })
    .then(function() {
      return new this.Widgets.NotebookList().findNotebook(name).should.eventually.be.ok;
    }.bind(this));
  });

  this.Then(/^I should see (\d+) open notebooks$/, function(count) {
    return new this.Widgets.OpenNotebookList().items().should.eventually.have.length(count);
  });

  this.Then(/^I should see (\d+) recent notebooks$/, function(count) {
    return new this.Widgets.RecentNotebooks().items().should.eventually.have.length(count);
  });

  this.Given(/^I open the rename modal for "([^"]*)"$/, function(notebook) {
    return new this.Widgets.NotebookList().openRenameModal(notebook);
  });

  this.When(/^I click the modal close button$/, function() {
    return new this.Widgets.Modal().close();
  });

  this.Then(/^the modal should be closed$/, function() {
    return new this.Widgets.Modal().isDisplayed().should.eventually.be.false;
  });

  this.Then(/^I should see the following open notebooks:$/, function(table, callback) {
    var expected = _.pluck(table.hashes(), 'name');
    return Promise.delay(1000).then(function() {
      return (new this.Widgets.OpenNotebookList).getNames().then(function(names) {
        return assert.deepEqual(names, expected);
      });
    }.bind(this));
  });

  this.When(/^I close the open notebook "([^"]*)"$/, function(name) {
    return (new this.Widgets.OpenNotebookList()).closeNotebook(name);
  });

  this.When(/^I delete the "([^"]*)" notebook$/, function(name) {
    return new this.Widgets.NotebookList().destroy(name).then(function() {
      return new this.Widgets.Modal().click('.accept');
    }.bind(this));
  });

  this.Given(/^I go to delete the "([^"]*)" notebook$/, function(name) {
    return new this.Widgets.NotebookList().destroy(name);
  });

  this.When(/^I cancel the dialog$/, function(callback) {
    return new this.Widgets.Modal().cancel();
  });

  this.Then(/^I should see the following notebooks:$/, function(table, callback) {
    var expected = _.pluck(table.hashes(), 'name');

    return new this.Widgets.NotebookList().getNames().should.eventually.deep.equal(expected);
  });

  this.When(/^I close the notebook$/, function(callback) {
    var _this = this;
    // I had to wrap the initial delay promise with $.when(),
    // it would throws "TypeError: circular promise resolution chain" otherwise.
    // Not sure why.
    return $.when(Promise.delay(3000))
    .then(function() {
      return new _this.Widgets.Notebook().close();
    })
    .then(function() {
      return new _this.Widgets.ProjectDetail().find();
    });
  });

  this.When(/^I import the notebook by uploading the "([^"]*)" file$/, function(file) {
    var importWidget = new this.Widgets.ImportNotebooks();
    return importWidget.startImport().then(function() {
      return importWidget.attachFile(file);
    })
  });

  this.When(/^I should see a notebook import error message$/, function() {
    var importWidget = new this.Widgets.ImportNotebooks();
    return importWidget.errorMessage().should.eventually.include('valid');
  });

  this.When(/^I move the "([^"]*)" notebook to the "([^"]*)" project$/, function(n, p) {
    var _this = this;
    var notebookList = new this.Widgets.NotebookList();
    return notebookList.move(n, p);
  });

  this.When(/^I rename the "([^"]*)" notebook to "([^"]*)"$/, function(notebook, newName) {
    var notebookList = new this.Widgets.NotebookList();
    return notebookList.openModalAndRename(notebook, newName);
  });

  this.When(/^I rename the notebook to "([^"]*)"$/, function(newName) {
    var _this = this;
    return Promise.delay(3000).then(function() {
      return new _this.Widgets.Notebook().openModalAndRename(newName);
    })
  });

  this.When(/^I rename the notebook "([^"]*)" instead$/, function(newName) {
    return new this.Widgets.NotebookList().rename(newName);
  });

  this.Then(/^I shouldn't see an error in the modal$/, function(callback) {
    return new this.Widgets.Modal().errorMessage().should.eventually.equal('');
  });

  this.Then(/^I should see the error: "([^"]*)"$/, function(e) {
    return (new this.Widgets.Error).getMessage().should.eventually.equal(e);
  });

  this.When(/^I make a new notebook$/, function() {
    return (new this.Widgets.ProjectDetail()).addNewNotebook();
  });

  this.When(/^I save the notebook as "([^"]*)"$/, function(name) {
    var _this = this;
    notebook = new this.Widgets.Notebook();
    return notebook.waitForBeaker().then(function() {
      return (new _this.Widgets.BeakerFrame()).saveAs(name);
    });
  });

  this.Then(/^I should be in the "([^"]*)" notebook$/, function(name) {
    return new this.Widgets.Notebook().name().should.eventually.equal(name);
  });

  this.Then(/^I should see an error in the modal saying "([^"]*)"$/, function(error) {
    return new this.Widgets.Modal().errorMessage().should.eventually.equal(error);
  });

  this.When(/^I save my changes to the notebook$/, function() {
    var _this = this;
    notebook = new this.Widgets.Notebook();
    return notebook.waitForBeaker().then(function() {
      return (new _this.Widgets.BeakerFrame()).saveChanges();
    });
  });

  this.When(/^I open the recent notebook "([^"]*)"$/, function(name) {
    return (new this.Widgets.RecentNotebooks()).clickItem(name);
  });

  this.When(/^I search for notebook "([^"]*)"$/, function (searchText) {
    var notebookSearch = new this.Widgets.ProjectSearch;
    return notebookSearch.search(searchText);
  });

  this.Then(/^I should see the following search results$/, function(table) {
    return (new this.Widgets.ProjectSearchList())
    .notebookContents()
    .should.eventually.eql(_.pluck(table.hashes(), 'name'));
  });

}