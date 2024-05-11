export {copyCode, copyData, moveCopied};

import {U, Ez} from "../../raf.js";

import {getFrames}        from "../update.js";
import {MEASER_, elms, g} from "../common.js";
import {jsonToText, easyToText, multiToText, copyTime} from "../copy.js";

import {isCSSSpace} from "./_load.js";
import {newTar}     from "./_update.js";
let id, isCSS; // shared by copyCode(), copyObj(), thus indirectly by multiObj()
//==============================================================================
function copyData(txt) {
    moveCopied(elms.data.getBoundingClientRect());
    const TAB = '\t';
    txt += TAB + Object.keys(g.left.color.space.coords).join(TAB);
    for (const f of getFrames())
        txt += copyTime(f) + TAB + f.left.join(TAB);

    return txt;
}
//==============================================================================
function copyCode() {
    let txt;
    moveCopied(elms.code.getBoundingClientRect());
    id    = g.left.spaces.value;
    isCSS = isCSSSpace(id);
    txt   = isCSS
          ? ""
          : `const color = new Color("${g.left.color.spaceId}", 0);\n`;

    if (elms.type.value == MEASER_)
        txt += multiToText(getNamedJSON(elms.multis.value), multiObj);
    else {
        const
        name = elms.easys.value,
        obj  = copyObj(id);
        txt += easyToText(name, jsonToText(obj));
    }
    return txt;
}
function copyObj() {
    const obj = newTar(g.left);
    obj.elm   = "document.body";
    obj.prop  = "P.bgColor";
    if (isCSS)
        obj.func = `F.${Ez.kebabToCamel(id)}`;
    else
        obj.colorjs = "color";

    return obj;
}
function multiObj(arr) {
    const obj  = copyObj();
    obj.easies = arr;
    return obj;
}
//==============================================================================
function moveCopied(tar) {  // tar is the event target's DOMRect
    const elm = elms.copied;
    const cop = elm.getBoundingClientRect();
    elm.style.left = tar.left + (tar.width  / 2) - (cop.width  / 2) + U.px;
    elm.style.top  = tar.top  - cop.height - 3 + U.px;
}