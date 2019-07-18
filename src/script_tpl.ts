"use strict";
// vim: ts=2 sw=2 sts=2 et:
/*
 *=======================================================================
 *    Filename:script_tpl.ts
 *
 *     Version: 1.0
 *  Created on: July 02, 2019
 *
 *      Author: corvo
 *=======================================================================
 */

import * as fs from 'fs';
import { Logger } from './logger';
import * as vscode from "vscode";
import * as path from 'path';

let JS_FUNC_FMT = `!js`;

// For python.snippets
let SINGLE_QUOTES = "'";
let DOUBLE_QUOTES = '"';

let NORMAL = 0x1;
let DOXYGEN = 0x2;
let SPHINX = 0x3;
let GOOGLE = 0x4;
let NUMPY = 0x5;
let JEDI = 0x6;
let VIM_VARS_MAP: Map<string, string> = new Map();

function jsFuncDecorator(funcName: string) {
    return `\`!js ${funcName}\``;
}

function jsFuncEval(snip: string,
    document: vscode.TextDocument, position: vscode.Position, token:vscode.CancellationToken) {
  const JS_SNIP_FUNC_PATTERN = /`!js (\w+)\`/g;
  if(!JS_SNIP_FUNC_PATTERN.test(snip)) {
      Logger.warn("The snip" +snip + " don't have any js function");

  }
  let [pattern, func_name] = JS_SNIP_FUNC_PATTERN.exec(snip) as RegExpExecArray;
  Logger.debug("Get ", pattern, func_name);
}


function get_quoting_style() {
    return SINGLE_QUOTES;
}

function get_markdown_title() {
    return jsFuncDecorator('js_markdown_title');
}

function js_markdown_title(
    document: vscode.TextDocument, position: vscode.Position, token:vscode.CancellationToken) {
    
}

function triple_quotes() {
    return get_quoting_style().repeat(3);
}

function var_parser(data: string) {
    // 只匹配let开头的语句, 并且要求只能是数字或是字符串
    // 数字可以不带引号, 字符串必须用单引号或是双引号包裹
    // 目前尚不能处理当前行的注释
    const VIM_VARS_PATERN = /^let g:(\w+)\s*=\s*(\d*|'[^\']*'|"[^\"]*")$/gm;
    let res = null;

    while ((res = VIM_VARS_PATERN.exec(data)) !== null) {
        let [_, key, value] = res as RegExpExecArray;
        // Logger.debug(key, value, res);
        // 正则表达式中的value带有'或是", 需要去掉
        VIM_VARS_MAP.set(key, value.replace(/['"]+/g, ''));
    }

}

// 读取给定文件中的vim变量
function init_vim_var(var_files: Array<string>) {
    var_files.forEach((file) => {
        console.log("Get file", file);
        const data = fs.readFileSync(file, 'utf8');
        var_parser(data);
    });
}

// 通过变量名获取vim中的变量
function get_vim_var(name: string) {
    if (VIM_VARS_MAP === null) {
        Logger.warn("There is no varilables in map");
        return '';
    }

    return VIM_VARS_MAP.get(name) || '';
}


export {
    get_quoting_style,
    get_markdown_title,
    init_vim_var,
    get_vim_var,
};

// for unittest
function main() {
    let TEST_VARS = [
        // only number
        `let g:ale_set_loclist = 1`,

        `let g:snips_author="corvo"`,

        // string with single quotes
        `let g:ale_echo_msg_error_str = 'Error'`,

        // string with single quotes
        `let g:ale_cpp_clangtidy_options = "p ./build/"`,

        // string with comments
        `let g:winManagerWindowLayout='NERDTree|TagList' "BufExplorer`,
    ];
    TEST_VARS.forEach((varDef) => {
        var_parser(varDef);
    });
    Logger.info("Get var ale_cpp_clangtidy_options:", get_vim_var('ale_cpp_clangtidy_options'));
    Logger.info("Get var no_exist:", get_vim_var('no_exist'));
}


if (require.main === module) {
    main();
}