import { app } from 'electron';
import path from 'path';

import { isDev } from '../utils/core.js';

const userDataPath = app.getPath('userData');
const dataCache = 'data-cache';

export const dataCacheDirname = isDev() ? dataCache : path.join(userDataPath, dataCache);