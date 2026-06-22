<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/128583254/26.1.2%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T444368)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
[![](https://img.shields.io/badge/💬_Leave_Feedback-feecdd?style=flat-square)](#does-this-example-address-your-development-requirementsobjectives)
<!-- default badges end -->

# DevExtreme DataGrid - Implement Three-State "Select All" Checkboxes within Group Rows

This example uses a [groupCellTemplate](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#groupCellTemplate) to add custom "Select All" checkboxes to DataGrid group rows. These checkboxes can be in one of the following states: checked, unchecked, and indeterminate (when multiple rows are selected within a group). This example binds the DataGrid to a remote data source and enables [remote operations](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/remoteOperations/).

![DevExtreme DataGrid - Implement Three-State "Select All" Checkboxes in Group Rows](images/devextreme-datagrid-select-all-checkbox.png)

To determine group row checkbox states and select/deselect rows, use the following properties:

- [selectionFilter](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#selectionFilter) (if [selection.deferred](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/selection/#deferred) is enabled)
- [selectedRowKeys](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#selectedRowKeys) (in other cases)

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
    - [GroupSelectionBehavior.js](jQuery/src/GroupSelectionBehavior.js)
- **ASP.NET Core**
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)
    - [GroupSelectionBehavior.js](ASP.NET%20Core/wwwroot/js/GroupSelectionBehavior.js)    
- **Angular**
    - [GroupRowSelectionHelper.ts](Angular/src/app/GroupRowSelection/GroupRowSelectionHelper.ts)
    - [group-row.component.html](Angular/src/app/GroupRowSelection/group-row-component/group-row.component.html)
    - [group-row.component.ts](Angular/src/app/GroupRowSelection/group-row-component/group-row.component.ts)
- **React**
    - [App.tsx](React/src/App.tsx)
    - [GroupRowComponent.tsx](React/src/GroupRowSelection//GroupRowComponent.tsx) 
    - [hooks.ts](React/src/GroupRowSelection/selection-context/hooks.ts)
- **Vue**
    - [Home.vue](Vue/src/components/HomeContent.vue)
    - [GroupRowComponent.vue](Vue/src/components/GroupRowSelection/GroupRowComponent.vue)
    - [GroupRowSelectionHelper.ts](Vue/src/components/GroupRowSelection/GroupRowSelectionHelper.ts)

## Documentation

- [DevExtreme CheckBox API Reference](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCheckBox/)
- [DevExtreme DataGrid API Reference](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/)

## More Examples

- [DataGrid Multiple Record Selection API Demo](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/MultipleRecordSelectionAPI)
<!-- feedback -->
## Does This Example Address Your Development Requirements/Objectives?

[<img src="https://www.devexpress.com/support/examples/i/yes-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-datagrid-select-all-checkboxes&~~~was_helpful=yes) [<img src="https://www.devexpress.com/support/examples/i/no-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-datagrid-select-all-checkboxes&~~~was_helpful=no)

(you will be redirected to DevExpress.com to submit your response)
<!-- feedback end -->
