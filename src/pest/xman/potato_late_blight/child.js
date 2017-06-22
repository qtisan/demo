/**
 * Created by qtisa on 2017/6/19.
 */

const { trigger, noop, XPLBLogger: logger } = require('../../utils');

// 准备核心功能方法
const { handleProcessCommand } = require('./core');

// 准备回调钩子
const hooks = require('./hooks');
const memo = {};

logger.info(`* process[pid:${process.pid}] forked..`);

process.on('message', handleProcessCommand(memo, hooks));

