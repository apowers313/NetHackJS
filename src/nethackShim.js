const path = require("path");

let Module;
let userCallback;
let savedOnRuntimeInitialized;

// starts nethack
function nethackStart(cb, inputModule = {}) {
    if (typeof cb !== "string" && typeof cb !== "function") {
        throw new TypeError("expected first argument to be 'Function' or 'String' representing global callback function name");
    }

    if (typeof inputModule !== "object") {
        throw new TypeError("expected second argument to be object");
    }

    globalThis.nethackCallback = nethackCallback;
    // if(userCallback.constructor.name !== "AsyncFunction") throw new TypeError(`expected 'globalThis["${cbName}"]' to be an async function`);
    userCallback = cb;

    // Emscripten Module config
    let {nethackOptions} = inputModule;
    delete inputModule.nethackOptions;
    Module = inputModule;
    savedOnRuntimeInitialized = Module.onRuntimeInitialized;
    Module.onRuntimeInitialized = function(... args) {
        // after the WASM is loaded, add the shim graphics callback function
        Module.ccall(
            "shim_graphics_set_callback", // C function name
            null, // return type
            ["string"], // arg types
            ["nethackCallback"], // arg values
            {async: true}, // options
        );

        // if the user had their own onRuntimeInitialized(), call it now
        if (savedOnRuntimeInitialized) {
            savedOnRuntimeInitialized(... args);
        }
    };

    // configure environment variable to set NetHack options
    Module.preRun = [setupNethackOptions];
    function setupNethackOptions() {
        Module.ENV.NETHACKOPTIONS = createNethackOptions(nethackOptions);
    }

    // load and run the module
    let factory = require(path.join(__dirname, "../build/nethack.js"));
    factory(Module);
}

function nethackCallback(name, ... args) {
    decodeArgs(name, args);
    return userCallback(name, ... args);
}

// make callback arguments friendly: convert numbers to strings where possible
function decodeArgs(name, args) {
    // if (!globalThis.nethackGlobal.makeArgsFriendly) return;

    // eslint-disable-next-line default-case
    switch (name) {
    case "shim_create_nhwindow":
        args[0] = globalThis.nethackGlobal.constants.WIN_TYPE[args[0]];
        break;
    case "shim_status_update":
        // which field is being updated?
        args[0] = globalThis.nethackGlobal.constants.STATUS_FIELD[args[0]];
        // arg[1] is a string unless it is BL_CONDITION, BL_RESET, BL_FLUSH, BL_CHARACTERISTICS
        if (args[0] !== "BL_CONDITION" &&
                        args[0] !== "BL_RESET" &&
                        args[0] !== "BL_FLUSH" &&
                        args[0] !== "BL_CHARACTERISTICS" &&
                        args[1]) {
            args[1] = getArg(name, args[1], "s");
        } else {
            args[1] = getArg(name, args[1], "p");
        }

        break;
    case "shim_display_file":
        args[1] = !!args[1];
        break;
    case "shim_display_nhwindow":
        args[0] = decodeWindow(args[0]);
        args[1] = !!args[1];
        break;
    case "shim_getmsghistory":
        args[0] = !!args[0];
        break;
    case "shim_putmsghistory":
        args[1] = !!args[1];
        break;
    case "shim_status_enablefield":
        args[3] = !!args[3];
        break;
    case "shim_add_menu":
        args[0] = decodeWindow(args[0]);
        // args[1] = mapglyphHelper(args[1]);
        // args[5] = decodeAttr(args[5]);
        break;
    case "shim_putstr":
        args[0] = decodeWindow(args[0]);
        break;
    case "shim_select_menu":
        args[0] = decodeWindow(args[0]);
        args[1] = decodeSelected(args[1]);
        break;
    case "shim_clear_nhwindow":
    case "shim_destroy_nhwindow":
    case "shim_curs":
    case "shim_start_menu":
    case "shim_end_menu":
    case "shim_print_glyph":
        args[0] = decodeWindow(args[0]);
        break;
    }
}

function decodeWindow(winid) {
    let {WIN_MAP, WIN_INVEN, WIN_STATUS, WIN_MESSAGE} = globalThis.nethackGlobal.globals;
    switch (winid) {
    case WIN_MAP: return "WIN_MAP";
    case WIN_MESSAGE: return "WIN_MESSAGE";
    case WIN_STATUS: return "WIN_STATUS";
    case WIN_INVEN: return "WIN_INVEN";
    default: return winid;
    }
    // return winid;
}

function decodeSelected(how) {
    let {PICK_NONE, PICK_ONE, PICK_ANY} = globalThis.nethackGlobal.constants.MENU_SELECT;
    switch (how) {
    case PICK_NONE: return "PICK_NONE";
    case PICK_ONE: return "PICK_ONE";
    case PICK_ANY: return "PICK_ANY";
    default: return how;
    }
}

function getArg(name, ptr, type) {
    let {getPointerValue} = globalThis.nethackGlobal.helpers;
    return (type === "o") ? ptr : getPointerValue(name, Module.getValue(ptr, "*"), type);
}

let optionMap = new Map([
    ["autoquiver", "boolean"],
    ["name", "string"],
]);

function createNethackOptions(opt) {
    let optStr = [];
    for (let key in opt) {
        if (!optionMap.has(key)) {
            throw new TypeError(`NetHack option not recognized: ${key}`);
        }

        let type = optionMap.get(key);
        checkType(key, opt[key], type);
        switch (type) {
        case "string": optStr.push(`${key}:${opt[key]}`); break;
        case "boolean": optStr.push(`${opt[key] ? "" : "!"}${key}`); break;
        default: throw new Error(`unknown type:${type}`);
        }
    }

    return optStr.join(",");
    // return "name:Bubba";
}

function checkType(key, val, type) {
    if (typeof val !== type) {
        throw new Error(`Expected NetHack option '${key}' to be ${type}`);
    }
}

// TODO: ES6 'import' style module
module.exports = nethackStart;

