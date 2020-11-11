/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import React, { useEffect, useState } from 'react';
import { MenuItem } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { orchestrateSelections } from './selectionsOrchestrator';
import {observer} from 'mobx-react';

type Event =  React.ChangeEvent<{ value: string }>

export const Component = observer((props: any) => {
  console.log("Component -> props", props)

  const [mappedSelections, setMappedSelections] = useState<{[key: string]: any[]}>({});
  const [selections, setSelections] = useState<{[key: string]: string}>({});
  const {expectMultipleDropdowns} = props.field.options;
  const onSelectChange = (event: Event, label: string) => {
    const selectedValue = event.target.value ?? null;
    
    if (selectedValue) {
      if (expectMultipleDropdowns) {
        setMultipleSelections(label, selectedValue, props.onChange);
      } else {
        setSingleSelection(selectedValue, props.onChange);
      }      
    }
  };
  
  const setSingleSelection = (selectedValue: any, onChange: any) => {
    onChange(selectedValue);
  }

  const setMultipleSelections = (label: string, selectedValue: any, onChange: any) => {
    const newSelections = { ...selections, [label]: selectedValue };
    setSelections(newSelections);
    onChange(newSelections);
  }

  useEffect(() => {
  console.log("useEffect -> props", props)

    const updateSelections = async () => {      
      try {
        const _mappedSelections = await orchestrateSelections(props);
        
        setMappedSelections(_mappedSelections);
        setSelections({})
      } catch (e) {
        console.error('Error', e);
      }
    };
    updateSelections();
  }, [getDependenciesFrom(props)])
  
  const possibleSelections = Object.keys(mappedSelections)

  return ( 
    <React.Fragment>
    {
      possibleSelections.map((dimension: string) => {
        return <RenderDropdown
                  key={dimension}
                  props={props}
                  onSelectChange={onSelectChange}
                  options={mappedSelections[dimension]}
                  label={dimension} 
                />
      })
    }
    </React.Fragment>
  )
});

Builder.registerEditor({
  name: 'dynamic-dropdown',
  component: Component
});

const RenderDropdown = (inputProps: any)  =>{
  const {props, onSelectChange, options, label} = inputProps;
  const {expectMultipleDropdowns} = props.field.options
 
  let value
  if (expectMultipleDropdowns) {
    value = props.value && props.value.get ? props.value.get(label) : ""
  } else {
    value = props.value ?? ""
  }
    
  return <TextField
    select
    label={label}
    fullWidth
    id="select-outlined"
    value={value}
    onChange={(event: Event) => onSelectChange(event, label)}
  >
    <MenuItem key="N/A" value="N/A">
      N/A
    </MenuItem>
    {options &&
      options.map((option: any, index: any) => (
        <MenuItem key={index} value={option.value}>
          {option.name}
        </MenuItem>
      ))}
  </TextField>;
}

const getDependenciesFrom = (props: any)  => {
  console.log("getDependencies -> props", props)
  
  const { dependencyComponentVariables } = props.field.options || ({} as any);
  const dynamicDependencies: string[] = []
  if (dependencyComponentVariables && dependencyComponentVariables.length) {
    dependencyComponentVariables.forEach((key: string) => {
      if (props.object.get(key) != null) {
        dynamicDependencies.push(props.object.get(key));
      }
    });

    return dynamicDependencies.join("-")
  }
    
  return ""  
}

