import { orchestrateSelections } from '../src/selectionsOrchestrator';
import * as selectionsClient from '../src/selectionsClient';
import * as mapperEvaluator from '../src/mapperEvaluator';



describe('Selections orchestrator', () => {
  const sharedProps = { context: {designerState: { editingContentModel: { data: { toJSON: jest.fn() } } }}}
  
  const selectionsClientSpy: jest.SpyInstance<any, [String, any?]> = jest.spyOn(
    selectionsClient,
    'executeGet'
  );
  const mapperEvaluatorSpy: jest.SpyInstance<any, [String, any?]> = jest.spyOn(
    mapperEvaluator,
    'safeEvaluate'
  );

  beforeEach(() => {
    selectionsClientSpy.mockClear();
    selectionsClientSpy.mockImplementation(() => []);

    mapperEvaluatorSpy.mockClear();
    mapperEvaluatorSpy.mockImplementation(() => []);
  });

  describe('given url is not cached', () => {
    it('should forward get request to client', async () => {
      await orchestrateSelections({...sharedProps, field: { options: {url:'url-1', mapper:'mapper-1'}}});

      expect(selectionsClientSpy).toHaveBeenCalledTimes(1);
    });

    it('should forward mapper request to evaluator', async () => {
      await orchestrateSelections({...sharedProps, field: { options: {url:'url-2', mapper:'url-2'}}});

      expect(mapperEvaluatorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('given url is cached', () => {
    beforeAll(async () => {
      await orchestrateSelections({...sharedProps, field: { options: {url:'cached-url', mapper:'mapper-1'}}});
    });

    it('not forward get request to client nor evaluator', async () => {
      await orchestrateSelections({...sharedProps, field: { options: {url:'cached-url', mapper:'mapper-1'}}});

      expect(selectionsClientSpy).not.toHaveBeenCalled();
      expect(mapperEvaluatorSpy).not.toHaveBeenCalled();
    });
  });
});
