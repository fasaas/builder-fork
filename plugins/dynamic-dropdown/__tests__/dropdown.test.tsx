// @ts-ignore
import React from 'react';
import { Component } from '../src/dropdown';
import { render, waitForDomChange, cleanup, act, wait } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import { orchestrateSelections } from '../src/selectionsOrchestrator';

jest.mock('@material-ui/core/TextField', () => (props: any) => {
  const { children, value, onChange, label } = props;
  const handleChange = (event: any) => {
    onChange(event);
  };

  return (
    <div data-testid="A_DROPDOWN">
      <select data-testid={label} value={value} onChange={handleChange}>      
        {children}
      </select>
    </div>

  );
});

describe('Dropdown plugin', () => {
  let dropdownProps: any


  beforeEach(() => {
    jest.resetAllMocks();
    dropdownProps = { 
      context: { designerState: {} }, onChange: jest.fn(),
      field: {options: {}}
     };

  });

  afterEach(cleanup);

  it('Displays a single dropdown', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      Dropdown: [
        { name: 'aName', value: 'aValue'},
        { name: 'anotherName', value: 'anotherValue'}
      ]
    });

    await act(async () => {
      const { queryAllByTestId } = render(<Component {...dropdownProps} />);
      await waitForDomChange();
      
      expect(queryAllByTestId("Dropdown")).toHaveLength(1);
    });
  })

  it('Displays a multiple dropdown', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1'},
        { name: 'anotherName1', value: 'anotherValue1'}
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2'},
        { name: 'anotherName2', value: 'anotherValue2'}
      ]
    });

    await act(async () => {
      const { queryAllByTestId } = render(<Component {...dropdownProps} />);
      await waitForDomChange();
      
      expect(queryAllByTestId("oneDimension")).toHaveLength(1);
      expect(queryAllByTestId("anotherDimension")).toHaveLength(1);
    });
  });

  it("updates state with values from all dropdowns", async () => {

    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1'},
        { name: 'anotherName1', value: 'anotherValue1'}
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2'},
        { name: 'anotherName2', value: 'anotherValue2'}
      ]
    });

    await act(async () => {
      const { queryByTestId } = render(<Component {...{...dropdownProps, field: {options: {expectMultipleDropdowns:true}}}} />);
      await waitForDomChange();
      const element: any = queryByTestId('oneDimension');
      const evt: any = { target: { value: 'aValue1' } };
      Simulate.change(element, evt);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'aValue1'});

      Simulate.change(element, { target: { value: 'anotherValue1' } } as any);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'anotherValue1'});


      const element2: any = queryByTestId('anotherDimension');
      const evt2: any = { target: { value: 'anotherValue2' } };
      Simulate.change(element2, evt2);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'anotherValue1', anotherDimension: 'anotherValue2'});
    });
  })

  it("return object with keys when expectMultipleDropdowns is enabled", async () => {

    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1'},
        { name: 'anotherName1', value: 'anotherValue1'}
      ]
    });

    await act(async () => {
      const { queryByTestId } = render(<Component {...{...dropdownProps, field: {options: {expectMultipleDropdowns:true}}}} />);
      await waitForDomChange();
      const element: any = queryByTestId('oneDimension');
      const evt: any = { target: { value: 'aValue1' } };
      Simulate.change(element, evt);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'aValue1'});
    });
  })

  it("return only value when expectMultipleDropdowns is disabled", async () => {

    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1'},
        { name: 'anotherName1', value: 'anotherValue1'}
      ]
    });

    await act(async () => {
      const { queryByTestId } = render(<Component {...{...dropdownProps, field: {options: {expectMultipleDropdowns:false}}}} />);
      await waitForDomChange();
      const element: any = queryByTestId('oneDimension');
      const evt: any = { target: { value: 'aValue1' } };
      Simulate.change(element, evt);

      expect(dropdownProps.onChange).toHaveBeenCalledWith('aValue1');
    });
  })

  it('shows mapped values', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1'},
        { name: 'anotherName1', value: 'anotherValue1'}
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2'},
        { name: 'anotherName2', value: 'anotherValue2'}
      ]
    });

    const { getByText, getAllByText } = render(<Component {...dropdownProps} />);
    await waitForDomChange()

    expect(getAllByText('N/A').length).toBe(2);
    expect(getByText('aName1')).toBeInTheDocument();
    expect(getByText('anotherName1')).toBeInTheDocument();
    expect(getByText('aName2')).toBeInTheDocument();
    expect(getByText('anotherName2')).toBeInTheDocument();
  });

  it('does not show any dropdown when there are no mappedSelections', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({});

    const { queryByTestId } = render(<Component {...dropdownProps} />);
    
    expect(queryByTestId("A_DROPDOWN")).not.toBeInTheDocument();
  });

  it('does not show any dropdown when orchestrate selections fails', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockRejectedValue("ERROR");
  
    const { queryByTestId } = render(<Component {...dropdownProps} />);
    
    expect(queryByTestId("A_DROPDOWN")).not.toBeInTheDocument();
  });

  it('re-renders when dependency values change', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockImplementation(
    (props: any) =>
    {
      if(props.object.get() === "dependency-value-1"){
        return { oneDimension: [ { name: 'aName1', value: 'aValue1'} ]}
      }

      if(props.object.get() === "dependency-value-2"){
        return { twoDimension: [ { name: 'aName2', value: 'aValue2'} ]}
      }
    });
    
    const firstComponentProps = {
      ...dropdownProps,
      object: { get: () => "dependency-value-1"},
      field: {options: { "dependencyComponentVariables": ["dependency"] } },
    }

    const { queryByTestId, rerender, queryByText } = render(<Component {...firstComponentProps} />);

    await waitForDomChange();

    expect(queryByText('aName1')).toBeInTheDocument();
    expect(queryByText('aName2')).not.toBeInTheDocument();

    const secondComponentProps = {
      ...dropdownProps,
      object: { get: () => "dependency-value-2"},
      field: {options: { "dependencyComponentVariables": ["dependency"] } },
    }

    rerender(<Component {...secondComponentProps} />)

    await waitForDomChange();

    expect(queryByText('aName1')).not.toBeInTheDocument();
    expect(queryByText('aName2')).toBeInTheDocument();
    
    expect(queryByTestId("oneDimension")).not.toBeInTheDocument();
    expect(queryByTestId("twoDimension")).toBeInTheDocument();
  })

  it('does not keep previous selected values when re-renders', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockImplementation(
    (props: any) =>
    {
      if(props.object.get() === "dependency-value-1"){
        return { oneDimension: [ { name: 'aName1', value: 'aValue1'} ]}
      }

      if(props.object.get() === "dependency-value-2"){
        return { twoDimension: [ { name: 'aName2', value: 'aValue2'} ]}
      }
    });
    
    const firstComponentProps = {
      ...dropdownProps,      
      object: { get: () => "dependency-value-1"},
      field: {options: { "dependencyComponentVariables": ["dependency"], expectMultipleDropdowns:true } },
    }

    const { queryByTestId, rerender } = render(<Component {...firstComponentProps} />);

    await waitForDomChange();

    const element: any = queryByTestId('oneDimension');
    const evt: any = { target: { value: 'aValue1' } };
    Simulate.change(element, evt);

    expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'aValue1'});
    
    const secondComponentProps = {
      ...dropdownProps,
      object: { get: () => "dependency-value-2"},
      field: {options: { "dependencyComponentVariables": ["dependency"], expectMultipleDropdowns:true } },
    }

    rerender(<Component {...secondComponentProps} />)

    await waitForDomChange();

    const element2: any = queryByTestId('twoDimension');
    const evt2: any = { target: { value: 'aValue2' } };
    Simulate.change(element2, evt2);

    expect(dropdownProps.onChange).toHaveBeenCalledWith({ twoDimension: 'aValue2'});
  })
});
