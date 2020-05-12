import React from "react";
import { StaticQuery, graphql } from "gatsby";
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import matchSorter from 'match-sorter';

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  const options =
        React.useMemo(() =>
                      {
                        const options = new Set();
                        preFilteredRows.forEach(row => { options.add(row.values[id]); });
                        const uniqueOptions = [...options.values()];
                        uniqueOptions.sort();
                        return uniqueOptions;
                      },
                      [id, preFilteredRows]);
  
  return (
    <select value={filterValue}
            onChange={e => { setFilter(e.target.value || undefined); }}>
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>{option}</option>
      ))}
    </select>
  );
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  return (
    <input
      type="text"
      value={filterValue || ''}
      onChange={e => { setFilter(e.target.value || undefined); }}
    />);
}

function ShortColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  return (
    <input
      type="text"
      size="4"
      value={filterValue || ''}
      onChange={e => { setFilter(e.target.value || undefined); }}
    />);
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = val => !val;

function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
            .toLowerCase()
            .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
      exact: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue === undefined ||
	    String(rowValue).localeCompare(String(filterValue), undefined, { sensitivity: 'base' }) === 0;
	});
      }}),
    []);
  
  const defaultColumn = React.useMemo(() => ({ Filter: DefaultColumnFilter }), []);
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      initialState: { pageSize: 20 }
    },
    useFilters,
    useSortBy,
    usePagination);

  const availablePageSizes = [10, 20, 50, 100, 200].filter(len => len < rows.length);
  if (rows.length <= 200)
    availablePageSizes.push('all');

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => (
                <th key={index}>
                  <span {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.isSorted ? column.isSortedDesc ? ' 🔽' : ' 🔼' : ''}
                    {column.render('Header')}
                  </span>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      { pageOptions.length < 2 ? '' :
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); }}>
          {
            availablePageSizes.map(pageSize => (
              <option key={pageSize} value={pageSize === 'all' ? rows.length : pageSize}>
                Show {pageSize}
              </option>
            ))}
        </select>
        </span>
      </div>
    }
    </>
  );
}

export default () => (
  <StaticQuery
    query={graphql`
      {
        allResultsCsv(sort: {fields: Year, order: ASC}) {
          nodes {
            Cat
            Club
            Name
            Pos
            Time
            Year
          }
        }
      }
    `}
    
    render = {data => <Table data={data.allResultsCsv.nodes} columns={[
      {
        Header: 'Year',
        accessor: 'Year', 
        Filter: SelectColumnFilter
      },
      {
        Header: 'Pos',
        accessor: 'Pos',
        Filter: ShortColumnFilter,
        filter: 'exact'
      },
      {
        Header: 'Name',
        accessor: 'Name',
        filter: fuzzyTextFilterFn
      },
      {
        Header: 'Club',
        accessor: 'Club', 
        Filter: SelectColumnFilter
      },
      {
        Header: 'Cat.',
        accessor: 'Cat', 
        Filter: SelectColumnFilter,
        filter: 'exact'
      },
      {
        Header: 'Time',
        accessor: 'Time',
        disableFilters: true
      },
    ]}/>}
  />
);
