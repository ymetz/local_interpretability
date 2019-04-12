import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';

const addLabel = (data, id_to_label) => {
    const outData = []
    data.forEach(function (d) {
        outData.push({ 'class': d.class, 'class_name': id_to_label[d.class], 'score': d.score.toPrecision(3) });
    })
    return outData;
}

const topPredictionTable = (props) => {
    const data = addLabel(props.data, props.id_to_label);

    const columns = [{
        dataField: 'class',
        text: 'Class ID'
    },
    {
        dataField: 'class_name',
        text: 'Class Name'
    },
    {
        dataField: 'score',
        text: 'Class Probability',
        sort: true
    }]

    const defaultSorted = [{
        dataField: 'score',
        order: 'desc'
    }];

    const selectRow = {
        mode: 'radio',
        clickToSelect: true,
        hideSelectColumn: true,
        bgColor: '#adebad',
        onSelect: (row, isSelect, rowIndex, e) => {
            props.onSelect(row.class);
        }
    }

    return (
        <BootstrapTable
            keyField='class'
            data={data}
            columns={columns}
            bordered={false}
            defaultSorted={defaultSorted}
            selectRow={selectRow}
            striped
            hover />
    )
}

export default topPredictionTable;