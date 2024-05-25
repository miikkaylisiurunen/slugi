#!/usr/bin/env node

import slugify from 'slugify';
import { Slugi } from './slugi';
import { DEFAULT_OPTIONS } from './constants';

const main = async () => {
  const slugi = new Slugi(DEFAULT_OPTIONS, slugify);
  const result = slugi.getSlugFromArguments(process.argv);
  if (!result.success) {
    throw result.error;
  }
  console.log(result.output);
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
