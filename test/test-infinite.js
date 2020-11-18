Error.stackTraceLimit = 20;
const RESTART_WAIT = 0;
const BYTES_PER_KB = 1024;
const NS_PER_SEC = 1e9;
const US_PER_SEC = 1e6;
let runCount = 0;
let startTime;
let startUsage;
/* global globalThis, WebAssembly */

// debugging to make sure the JavaScript event loop isn't blocked
// const {performance} = require("perf_hooks");
// let currentTime = 0;
// let lastTime = 0;
// setInterval(() => {
//     lastTime = currentTime;
//     currentTime = performance.now();
//     console.log("Time since last JavaScript loop:", currentTime-lastTime);
// }, 10);

let Module;
function buildWasmModule() {
    Module = {
        logReadFiles: true,
        // noExitRuntime: false,
        // noInitialRun: false,
        print: () => {},
        printErr: () => {},
        // print: (... args) => console.info(... args),
        // printErr: (... args) => console.warn(... args),
        // undocumented callback function that is run when the emscripten program completes
        quit: function(errorCode) {
            console.info(`NetHack run # ${runCount} completed with status:`, errorCode);
            let cpuUsage = process.cpuUsage(startUsage);
            let endTime = process.hrtime.bigint();
            let runTime = endTime - startTime;
            console.debug(`Run time: ${ns2s(runTime)}   User CPU: ${cpuUsage.user / US_PER_SEC}   System CPU: ${cpuUsage.system / US_PER_SEC}`);
            // console.debug("quit: pending lock:", globalThis.nethackGlobal.shimFunctionRunning);

            // // cleanup
            // Module.ccall(
            //     "shim_graphics_set_callback", // C function name
            //     null, // return type
            //     ["string"], // arg types
            //     [null], // arg values
            //     // {async: true}, // options
            // );
            // delete globalThis.nethackGlobal;
            // delete globalThis.nethackCb;
            // destroyObj(Module);

            // run NetHack in an infinite loop
            runNethack();
        },
    };
    return Module;
}

function runNethack() {
    runCount++;
    console.info(`Starting NetHack: run #${runCount}`);
    let {rss, heapTotal, heapUsed, external, arrayBuffers} = process.memoryUsage();
    let percentHeap = (heapUsed / heapTotal) * 100;
    console.debug(`Heap Usage: ${b2s(heapUsed)} (${percentHeap.toFixed(1)}% of ${b2s(heapTotal)}) :: ArrayBuffers: ${b2s(arrayBuffers)}   External: ${b2s(external)}   [Total Memory (RSS): ${b2s(rss)}]`);
    let nethackStart = require("../src/nethackShim.js");
    setTimeout(() => {
        startUsage = process.cpuUsage();
        startTime = process.hrtime.bigint();
        nethackStart(nethackCb, buildWasmModule());
        process.removeAllListeners("uncaughtException");
        process.removeAllListeners("unhandledRejection");
        process.on("uncaughtException", function(ex) {
            console.warn("uncaughtException (but it's okay)");
            // TODO: check if message is "unreachable" and top of stack is "at nh_terminate (<anonymous>:wasm-function[974]:0x13abdd)"
            if (!(ex instanceof WebAssembly.RuntimeError)) {
                console.error("THROWING", ex);
                throw ex;
            }
        });
    }, RESTART_WAIT);
}

// # bytes to string
function b2s(b) {
    let size = 0;

    while (b > BYTES_PER_KB) {
        b = b / BYTES_PER_KB;
        size++;
    }

    switch (size) {
    case 0: return `${b.toFixed(2)} B`;
    case 1: return `${b.toFixed(2)} KB`;
    case 2: return `${b.toFixed(2)} MB`;
    case 3: return `${b.toFixed(2)} GB`;
    case 4: return `${b.toFixed(2)} TB`;
    default: return `${b.toFixed(2)} ??`;
    }
}

// nanoseconds to seconds string
function ns2s(ns) {
    let s = BigInt(ns) / BigInt(NS_PER_SEC);
    // ns = ns - (BigInt(ns) / BigInt(NS_PER_SEC));
    // return `${s}.${ns} sec.`;
    return `${s} sec.`;
}

runNethack();

let winCount = 0;
// eslint-disable-next-line consistent-return
async function nethackCb(name, ... args) {
    switch (name) {
    case "shim_init_nhwindows":
        // console.log("globalThis.nethackGlobal", globalThis.nethackGlobal);
        break;
    case "shim_create_nhwindow":
        winCount++;
        // console.log("creating window", args, "returning", winCount);
        return winCount;
    case "shim_print_glyph":
        /* eslint-disable no-var, prefer-destructuring */
        var x = args[1];
        var y = args[2];
        var glyph = args[3];

        var ret = globalThis.nethackGlobal.helpers.mapglyphHelper(glyph, x, y, 0);
        // console.log(`GLYPH (${x},${y}): ${String.fromCharCode(ret.ch)}`);
        return undefined;
    // case "shim_update_inventory":
    //     globalThis.nethackGlobal.helpers.displayInventory();
    //     return;
    case "shim_select_menu":
        return await selectMenu(... args);
    case "shim_yn_function":
    case "shim_message_menu":
        return 121; // 'y'
    case "shim_getmsghistory":
        return "";
    case "shim_nhgetch":
    case "shim_nh_poskey":
        return 0;
    default:
        // console.log(`called doGraphics: ${name} [${args}]`);
        return 0;
    }
}

async function selectMenu(window, how, selected) {
    Module.setValue(selected, 0, "*");
    return -1;
}
