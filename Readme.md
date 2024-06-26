<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/128583254/20.1.7%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T444368)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
[![](https://img.shields.io/badge/💬_Leave_Feedback-feecdd?style=flat-square)](#does-this-example-address-your-development-requirementsobjectives)
<!-- default badges end -->

# DataGrid for DevExtreme - How to implement a three-state "Select All" CheckBox in a group row 

This example demonstrates how to implement a custom "Select All" CheckBox in a group row to select all rows in this group. This CheckBox can have three states: unchecked, checked, or undetermined (when only several of the group members are checked). 

This solution is designed to work with in-memory data.

<div align="center"><img alt="Implement a three-state "Select All" CheckBox" src="devextreme-datagrid-select-all-checkbox.png" /></div>

## Files to Review

- **jQuery**
    - [DataGridGroupSelection.js](jQuery/DataGridGroupSelection.js)
    - [GroupSelectionHelper.js](jQuery/GroupSelectionHelper.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
    - [GroupSelectionHelper.ts](Angular/src/app/GroupSelectionHelper.ts)
- **ASP.NET**    
    - [Index.cshtml](ASP.NET/Views/Home/Index.cshtml)
    - [GroupSelectionHelper.js](ASP.NET/wwwroot/js/GroupSelectionHelper.js)

## Implementation details

Implement a GroupSelectionHelper helper class. Use the [customizeColumns](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#customizeColumns) function to specify the [groupCellTemplate](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#groupCellTemplate) that creates a CheckBox for every group row. 

The synchronizeCheckBoxes function in the helper class is called every time user makes a selection. In this example, this function helps to synchronize parent and nested group rows.

## Documentation

- [CheckBox - API Reference](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCheckBox/)
- [DataGrid - API Reference](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/)

## More Examples

- [DataGrid Multiple Record Selection API Demo](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/MultipleRecordSelectionAPI)
<!-- feedback -->
## Does this example address your development requirements/objectives?

[<img src="https://www.devexpress.com/support/examples/i/yes-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-datagrid-select-all-checkboxes&~~~was_helpful=yes) [<img src="https://www.devexpress.com/support/examples/i/no-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-datagrid-select-all-checkboxes&~~~was_helpful=no)

(you will be redirected to DevExpress.com to submit your response)
<!-- feedback end -->
