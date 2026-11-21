import * as dependencies from './payments.ts';
import {createProcessor} from './deposit-engine.mjs';
export const processPayment=createProcessor(dependencies);
