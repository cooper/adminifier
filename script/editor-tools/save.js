(function (a) {

document.addEvent('editorLoaded', loadedHandler);
document.addEvent('pageUnloaded', unloadedHandler);

var ae;
function loadedHandler () {
    ae = a.editor;

    // add toolbar functions
    Object.append(ae.toolbarFunctions, {
        save:       displaySaveHelper
    });

    // add keyboard shortcuts
    ae.addKeyboardShortcuts([
        [ 'Ctrl-S', 'Command-S',    'save'      ]
    ]);
    
    // start the autosave timer
    resetAutosaveInterval();
}

function unloadedHandler () {
    document.removeEvent('editorLoaded', loadedHandler);
    document.removeEvent('pageUnloaded', unloadedHandler);
    clearAutosaveInterval();
}

// SAVE COMMIT HELPER

function displaySaveHelper () {
    return _saveHelper(false);
}

function _saveHelper () {
    var li  = ae.liForAction('save');
    var box = ae.createPopupBox(li);
    ae.fakeAdopt(box);

    box.innerHTML = tmpl('tmpl-save-helper', {
        file: ae.getFilename()
    });

    var closeBoxSoon = function () {
        setTimeout(function () {

            // make the box no longer sticky, so that when the user
            // clicks away, it will disappear now
            box.removeClass('sticky');

            // close the popup only if the mouse isn't over it
            ae.closePopup(box, {
                unlessActive: true,
                afterHide: function () {
                    li.getElement('span').set('text', 'Save');
                }
            });

        }, 3000);
    };

    // save changes function
    var saveChanges = function () {

        // already saving
        var message = $('editor-save-message');
        if (!message)
            return;

        var saveData = editor.getValue();

        // prevent box from closing for now
        box.addClass('sticky');
        var message = message.getProperty('value');

        // "saving..."
        $('editor-save-wrapper').innerHTML = tmpl('tmpl-save-spinner', {});
        var btn = $('editor-save-commit');
        btn.innerHTML = 'Comitting changes';
        btn.addClass('progress');

        // save failed callback
        var fail = function (msg) {
            alert('Save failed: ' + msg);

            // switch to /!\
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-exclamation-triangle');

            // update button
            btn.addClass('failure');
            btn.removeClass('progress');
            btn.innerHTML = 'Save failed';

            closeBoxSoon();
        };

        // successful save callback
        var success = function (data) {
            console.log(data);
            ae.lastSavedData = saveData;

            // something went wrong in the page display
            var displayBad = false, res = data.result;
            if (!res || res.type == 'not found' && !res.draft)
                displayBad = true;

            // switch to checkmark
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-check-circle');

            // update button
            btn.removeClass('progress');
            btn.addClass(displayBad ? 'warning' : 'success');
            var text = data.unchanged ?
                'File unchanged' : 'Saved ' + data.rev_latest.id.substr(0, 7);
            if (displayBad)
                text += ' with errors';
            btn.innerHTML = text;

            // show the page display error
            ae.handlePageDisplayResult(res);

            closeBoxSoon();
        };

        // save request
        saveRequest(saveData, message, success, fail);
    };

    // display it
    if (!ae.displayPopupBox(box, 120, li))
        return;

    // on click or enter, save changes
    $('editor-save-commit').addEvent('click', saveChanges);
    $('editor-save-message').onEnter(saveChanges);
    $('editor-save-message').focus();
}

function autosave () {
    if (ae.currentPopup) return; // FIXME
    
    // make it apparent that autosave is occurring
    var li = ae.liForAction('save');
    ae.setLiLoading(li, true, true);
    li.getElement('span').set('text', 'Autosave');
    
    // on fail or success, close the li
    var done = function () {
        setTimeout(function () {
            ae.setLiLoading(li, false, true);
        }, 2000);
        setTimeout(function () {
            li.getElement('span').set('text', 'Save');
        }, 2500);
    };
    
    // attempt to save
    var saveData = editor.getValue();
    saveRequest(saveData, 'Autosave', function (data) { // success
        done();
        ae.lastSavedData = saveData;
        ae.handlePageDisplayResult(data.result);
    }, function (msg) { // failure
        done();
        alert('Save failed: ' + msg);
    });
}

function saveRequest (saveData, message, success, fail) {

    // do the request
    new Request.JSON({
        url: 'functions/write-page.php' + (ae.isModel() ? '?model' : ''),
        secure: true,
        onSuccess: function (data) {

            // updated without error
            if (data.success)
                success(data);

            // revision error

            // nothing changed
            else if (data.rev_error && data.rev_error.match(/no changes|nothing to commit/)) {
                data.unchanged = true;
                success(data);
            }

            // git error
            else if (data.rev_error)
                fail(data.rev_error);

            // other error
            else if (data.reason)
                fail(data.reason);

            // not sure
            else
                fail("Unknown error");
        },
        onError: function () {
            fail('Bad JSON reply');
        },
        onFailure: function (data) {
            fail('Request error');
        },
    }).post({
        page:       ae.getFilename(),
        content:    saveData,
        message:    message
    });

    // reset the autosave timer
    resetAutosaveInterval();
}

var autosaveInterval;
function resetAutosaveInterval () {
    clearAutosaveInterval();
    if (a.autosave) {
        autosaveInterval = setInterval(autosave, a.autosave);
    }
}

function clearAutosaveInterval () {
    if (autosaveInterval != null)
        clearInterval(autosaveInterval);
}

})(adminifier);
