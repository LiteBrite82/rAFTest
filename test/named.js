export {DEFAULT_NAME, ns, preClass, presets,
        loadNamed, setPrefix, disableSave, disablePreset, disableDelete};
const DEFAULT_NAME = ""; // default value for <select> and named Easy, MEaser

import {changeStop}                            from "./play.js";
import {loadCopy}                              from "./copy.js";
import {getLocalNamed, setNamed, storeCurrent} from "./local-storage.js";
import {CHANGE, CLICK, EASY_, MEASER_, dlg, elms, g, addEventsByElm}
                                               from "./common.js";
/*
import(_named.js): formFromObj, updateNamed - objFromForm unused
import(_load.js) : updateAll via loadNamed(..., _load) { ns_load = _load; }
*/
let ns, ns_load, preClass, presets; // ns exported for storeCurrent()
//==============================================================================
// loadNamed() called by loadCommon()
async function loadNamed(isMulti, dir, _load) {
    ns_load = _load;                      // for openNamed()
    setPrefix(isMulti ? MEASER_ : EASY_); // prefix by class

    elms.named.addEventListener(CHANGE, openNamed, false);
    if (elms.multis)
        elms.multis.addEventListener(CHANGE, openNamed, false);
    else if (elms.save) {
        elms.revert.addEventListener(CLICK, openNamed, false);
        addEventsByElm(
            CLICK, [elms.save,elms.preset,elms.delete, dlg.ok, dlg.cancel], handlers
        );
    }
    return import(`${dir}_named.js`).then(namespace => {
        ns = namespace;
        if (elms.copied)
            loadCopy(isMulti, dir, ns);
        return ns;
    }); // .catch(errorAlert) in Promise.all() in loadCommon()
}
// setPrefix() allows color page to change types
function setPrefix(prefix) {
    preClass = prefix;
    presets  = g.presets[preClass];
}
//==============================================================================
const handlers = {  // event handlers, not exported
    clickSave() {    // #save
        dlg.name.value = elms.named.value;
        elms.dialog.showModal();
    },
    clickPreset() { // #preset
        localStorage.removeItem(preClass + elms.named.value);
        openNamed();
    },
    clickDelete() { // #delete
        const elm = elms.named;
        elm.removeChild(elm.selectedOptions[0]);
        elm.selectedIndex = 0;
        localStorage.removeItem(preClass + elm.value);
        openNamed();
    },
    clickOk() {     // #ok, auto-naming camelCases it to Ok, not OK
        let i;
        // <option> trims .textContent, so I trim .value to avoid confusion
        const name = dlg.name.value.trim();
        if (!name) { // checkValidity() is useless here: it requires user input
            alert("You must enter a name, and it cannot contain only whitespace.");
            return;
        } //--------------- storeCurrent() calls disableSave()
        disablePreset(name, storeCurrent(preClass + name));
        disableDelete(name);
        if (presets[name] && elms.preset.disabled)
            localStorage.removeItem(preClass + elm.value);

        const elm = elms.named;
        elm.value = name;
        if (elm.selectedIndex < 0) {
            i = Array.from(elm.options)
                     .findIndex(v => v.value > name);
            elm.add(new Option(name), i);
            elm.value = name;
        }
        ns.ok?.(name);   // easings page has more lists the need updating
        elms.dialog.close();
    },
    clickCancel() { // #cancel
        elms.dialog.close();
    }
} // reply all, u turn left, turn left, subdirectory arrow left
//==============================================================================
// openNamed() is the change event handler for elms.named and click event
//             handler for elms.revert, also called by clickDelete() below.
function openNamed() {                // not exported
    const name = elms.named.value;
    const item = getLocalNamed(name); // localStorage overrides presets
    const obj  = item ? JSON.parse(item) : presets[name];

    ns.formFromObj?.(obj);            // color page has no formFromObj()
    if (!ns.updateNamed(obj))
        return;
    //------------------
    changeStop();       // reset/update whatever's left over:
    ns_load.updateAll();
    disableSave(true);
    disablePreset(name, item);
    disableDelete(name);
    setNamed(name, item);
}
// disableSave() called by openNamed(), storeCurrent(), loadFinally()
function disableSave(b) {
    if (elms.save) {
        elms.save  .disabled = b;
        elms.revert.disabled = b;
        elms.save  .enabled  = !b; // unauthorized extension
        elms.revert.enabled  = !b; // see disablePlay()
    }
}
// disablePreset() called by openNamed(), clickOk(), loadFinally()
function disablePreset(name, item) {
    if (elms.preset) {
        elms.preset.disabled = !name || !item
                            || !presets[name]
                            || JSON.stringify(presets[name]) == item;
        elms.preset.enabled  = !elms.preset.disabled;
    }
}
// disableDelete() called by openNamed(), clickOk(), loadFinally()
function disableDelete(name) { // can't delete default or presets
    if (elms.delete) {
        elms.delete.disabled = !name || !presets[name];
        elms.delete.enabled  = !elms.delete.disabled;
    }
}