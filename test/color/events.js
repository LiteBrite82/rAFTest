export {loadEvents, timeFactor, getCase};
export let isMulti;

import Color from "https://colorjs.io/dist/color.js";

import {E, Fn, P} from "../../raf.js";

import {ezX}                            from "../load.js";
import {msecs, timeFrames, updateTime}  from "../update.js";
import {setPrefix}                      from "../named.js";
import {setLocal, setLocalBool}         from "../local-storage.js";
import {CHANGE, CLICK, INPUT, MEASER_, elms, g, is, toggleClass, boolToString,
        addEventToElms, addEventsByElm} from "../common.js";

import {refRange, resizeWindow} from "./_load.js";
import {refresh, oneCounter}    from "./_update.js";

const btnText = { // textContent: boolean as number is index into each array
    compare: ["switch_left", "switch_right"],
    roundT:  ["repeat",      "repeat_on"   ],
    collapse:["expand_less", "expand_more" ]
};
//==============================================================================
// loadEvents() is called exclusively by loadIt(), helps keep stuff private
function loadEvents() {
    addEventsByElm(CLICK,  g.clicks, click);
    addEventToElms(INPUT,  [elms.startInput, elms.endInput],    input.color);
    addEventToElms(CHANGE, [elms.leftSpaces, elms.rightSpaces], change.space);
    elms.time.addEventListener(INPUT,  input.time,  false);
    elms.type.addEventListener(CHANGE, change.type, false);
    change.type();              // sets isMulti
    return is({multi:isMulti});
}
//==============================================================================
//    input event handlers:
const input = {
 // color() handles input events for #startInput, #endInput, validates that text
 //         is a CSS color, updates start | end for both left & right.
    color(evt) {
        const tar = evt.target;
        const se  = g[getCamel(tar)];  // g.start or g.end

        try { se.color = new Color(tar.value); }
        catch {
            input.invalid(tar, true);
            return;     // only saves valid values to localStorage
        }
        //------------------------
        input.invalid(tar, false);
        se.canvas.style.backgroundColor = se.color.display();
        for (const lr of g.leftRight)
            updateOne(se, lr);
        setLocal(tar);
        if (!evt.isLoading)
            refresh();
    },
 // invalid() helps color()
    invalid(elm, b) {
        toggleClass(elm, "invalid", b);
        elms.x   .disabled = b;
        elms.play.disabled = b;
    },
 // time() splits the work with change.time(), handles only the immediate tasks
    time(evt) {
        timeFrames(evt);
    }
};
//==============================================================================
//    change event handlers:
const change = {
 // time() handles the less-than-immediate tasks
    time(evt) {
        const ezs = g.easies.easies;    // shallow copy as Array
        if (isMulti) {
            const f = timeFactor(ezs, isMulti);
            for (ez of ezs)
                if (ez !== ezX)         // for when #stop.value == RESET,
                    setEasyTime(ez, f); // because this precedes refresh().
        }
        else
            ezColor.time = msecs;

        updateTime();
        refresh();
        setLocal(evt.target);
    },
 // space() updates start & end for one side left | right
    space(evt) {
        const tar = evt.target;
        const lr  = g[getCamel(tar)];      // g.left|right
        const opt = tar.selectedOptions[0];
        const id  = opt.dataset.spaceId;

        lr.color = new Color(id, 0);
        lr.range = refRange[id];
        if (!evt.isLoading) {
            for (const se of g.startEnd)
                updateOne(se, lr);
            refresh();
        }
        const display = lr.color.display().split(E.func);
        lr.display.textContent = (display[0] == Fn.color)
                               ? display[1].split(E.sp)[0]
                               : display[0];
        setLocal(tar);
    },
 // type() swaps elms.named, indirectly calls openNamed().
    type(evt) {
        const val = elms.type.value;
        if (evt)                            // !evt = called by loadEvents()
            P.displayed(elms.named, false); // hide the old <select>

        isMulti = (val == MEASER_);
        elms.named = isMulti ? elms.multis : elms.easys;
        P.displayed(elms.named, true);      // show the new <select>
        setLocal(elms.type, val);
        if (evt) {
            setPrefix(val);                 // must precede openNamed()
            elms.named.dispatchEvent(new Event(CHANGE)); // calls openNamed()
        }
    }
};
//==============================================================================
//    click event handlers:
const click = {
 // compare() shows|hides the right side
    compare(evt) {
        const b = click.boolBtn(evt);
        const r = g.right;
        P.visible  ([r.display, r.start, r.value, r.end], b);
        P.displayed([r.spaces, r.canvas], b);
        P.displayed(elms.divCopy, !b);
        elms.leftCanvas.style.width = b ? "50%" : "100%";
        if (b && !evt.isLoading)
            refresh();
    },
 // roundT() elm.id distinguishes it from elms.roundTrip on other test pages
    roundT(evt) {
        click.boolBtn(evt);
    },
 // collapse() shows|hides inputs & counters
    collapse(evt) {
        const b = click.boolBtn(evt.target);
        P.displayed(elms.collapsible, !b);
        if (!evt.isLoading)
            resizeWindow(null, b);
    },
 // boolBtn() helps these boolean buttons (symBtns as pseudo-checkboxes)
    boolBtn(evt) {
        const tar = evt.target;
        const b   = !tar.value;
        tar.value = boolToString(b);
        tar.textContent = btnText[tar.id][Number(b)];
        if (!evt.isLoading)
            setLocalBool(tar, !b);
        return b;
    }
};
//==============================================================================
// updateOne() helps input.color() and change.space(), updates one of the
//             4 pairs of coordinates & text: start|end x left|right.
// arguments:  se = g.start|end, lr = g.left|right
// se[lr.id] = g.start|end.left|right = color coordinates, Array
// lr[se.id] = g.left|right.start|end = elms.left|rightStart|End, <span>
function updateOne(se, lr) {
    se[lr.id] = se.color[lr.color.spaceId.replaceAll("-", "_")];
    oneCounter(se[lr.id], lr[se.id], lr.range);
}
// timeFactor() helps change.time() and initEasies(), only if (isMulti)
function timeFactor(easys) {
    return msecs / Math.max(...easys.map(ez => ez.firstTime));
}
//==============================================================================
function getCamel(elm) {
    return elm.id.slice(0, elm.id.search(/[A-Z]/));
}
function getCase(elm) {
    return elm.id.slice(elm.id.search(/[A-Z]/));
}