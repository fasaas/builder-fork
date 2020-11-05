import { safeEvaluate } from './mapperEvaluator';
import { executeGet } from './selectionsClient';
import { getMassagedProps } from './dropdownPropsExtractor';

const selectionsCache = new Map();

const orchestrateSelections = async (props: any) => {
  const { url, mapper } = getMassagedProps(props);
  const cacheKey = `${url}-${mapper}`;
  if (selectionsCache.has(cacheKey)) return selectionsCache.get(cacheKey);

  const data = await executeGet(url);
  const mappedSelections = safeEvaluate(mapper, { data });

  selectionsCache.set(cacheKey, mappedSelections);
  return mappedSelections;
};

export { orchestrateSelections };
