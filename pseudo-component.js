import React from 'react';
import ReactDOM from 'react-dom';

class DateInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = { showDatePicker: false };

        this.handleDateRangeSelection = this.handleDateRangeSelection.bind(this);
    }

    handleClick() {
        this.setState({ showDatePicker: true });
    }

    handleClose() {
        this.setState({ showDatePicker: false });
    }

    handleDateRangeSelection(startDate, endDate) {
        this.props.onFilterUpdate({ startDate, endDate });
    }

    render() {
        let dateRange = `${this.props.startDate - this.props.endDate}`;

        return (
            <div>
                <input type="text" value={ dateRange } onClick={ this.handleClick } />

                <DatePicker
                    startDate={ this.props.startDate }
                    endDate={ this.props.endDate }
                    show={ this.state.showDatePicker }
                    onDateRangeSelection={ this.handleDateRangeSelection }
                    onClose={ () => this.handleClose }
                />
            </div>
        );
    }
}

class Pagination extends React.Component {
    constuctor() {
        super(props);

        this.handleFirstButtonClick = this.handleFirstButtonClick.bind(this);
        this.handlePrevButtonClick = this.handlePrevButtonClick.bind(this);
        this.handleNextButtonClick = this.handleNextButtonClick.bind(this);
        this.handleLastButtonClick = this.handleLastButtonClick.bind(this);
    }

    handleFirstButtonClick() {
        this.props.onFilterUpdate({ page: 1 });
    }

    handlePrevButtonClick() {
        var prevPage = this.props.page - 1;

        this.props.onFilterUpdate({ page: prevPage });
    }

    handleNextButtonClick() {
        var nextPage - this.props.page + 1;

        this.props.onFilterUpdate({ page: nextPage });
    }

    handleLastButtonClick() {
        var lastPage = Math.floor(this.props.totalResults / this.props.pageSize);

        this.props.onFilterUpdate({ page: lastPage });
    }

    render() {
        let page = this.props.page;
        let pageSize = this.props.pageSize;
        let totalResults =  this.props.totalResults;

        let start = (page - 1) * pageSize + 1;
        let end = totalResults;

        if (pageSize < totalResults) {
            end = pageSize * page;
            if (end > totalResults) {
                end = totalResults;
            }
        }

        let paginationText = `${start} - ${end} of ${totalResults}`;
        let isFirstPage = (page === 1);
        let isLastPage = (page === Math.floor(totalResults / pageSize));

        return (
            <div>
                <div>
                    <p>{ paginationText }</p>
                </div>
                <div>
                    <button disabled={!isFirstPage} onClick={ this.handleFirstButtonClick } />
                    <button disabled={!isFirstPage} onClick={ this.handlePrevButtonClick } />
                    <button disabled={!isLastPage} onClick={ this.handleNextButtonClick } />
                    <button disabled={!isLastPage} onClick={ this.handleLastButtonClick } />
                </div>
            </div>
        );
    }
}

class EventTableRow extends React.Component {
    render() {
        return (
            <tr>
                <td className={ this.props.result.event }>{ this.props.result.event }</td>
                <td>{ this.props.result.location }</td>
                <td>{ this.props.result.zone }</td>
                <td>{ this.props.result.type }</td>
                <td>{ this.props.result.reference }</td>
                <td>{ this.props.result.timestamp }</td>
            </tr>
        );
    }
}

class EventTable extends React.Component {
    render() {
        let resultRows = this.props.results.map((result) => {
            return <EventTableRow result={ result } />
        });

        return (
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Location</th>
                        <th>Zone</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    { resultRows }
                </tbody>
            </table>
        );
    }
}

class FilterableEventTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            filters: {
                startDate: moment().startOf('day'),
                endDate: moment().add(1, 'day').endOf('day'),
                locationId: '',
                zoneId: '',
                page: 1,
                pageSize: 20
            },
            loading: false,
            results: [],
            totalResults: 0
        };

        this.handleFilterUpdate = this.handleFilterUpdate.bind(this);
    }

    componentDidMount() {
        this.fetchData(this.state.filters);
    }

    fetchData(filters) {
        let component = this;
        let url = new URL(baseApiUrl);

        Object.keys(filters).forEach(key => url.searchParams.append(key, filters[key]));

        component.setState({ loading: true });

        fetch(url)
        .then(response => response.json())
        .then(json => component.setState({
            errors: [],
            loading: false,
            page: json.page,
            pageSize: json.pageSize,
            results: json.results,
            totalResults: json.totalResults
        }))
        .catch(error => component.setState({ error });
    }

    handleFilterUpdate(newFilters) {
        let filters = Object.assign({}, this.state.filters, newFilters);

        this.fetchData(filters);
    }

    render() {
        let hasErrors = this.state.errors.length > 0;
        let isLoading = this.state.loading;

        return (
            <div>
                <h1>{ this.props.title }</h1>

                <DateInput
                    startDate={ this.state.filters.startDate }
                    endDate={ this.state.filters.endDate }
                    onNewDateRange={ this.handleFilterUpdate }
                />

                <div>
                    <div>
                        <LocationSelect
                            selected={ this.state.filters.locationId },
                            onFilterUpdate= { this.handleFilterUpdate }
                        />
                        <ZoneSelect
                            selected={ this.state.filters.zoneId },
                            onFilterUpdate= { this.handleFilterUpdate }
                        />
                    </div>
                    <Pagination
                        page={ this.state.filters.page }
                        pageSize={ this.state.filters.pageSize }
                        totalResults={ this.state.totalResults }
                        onFilterUpdate= { this.handleFilterUpdate }
                    />
                </div>
                <div>
                    { hasErrors ? (
                        <ErrorNotification errors={ this.state.errors } />
                    ) : (
                        { isLoading ? (<LoadingNotification/>) : (<EventsTable results={ this.state.results } />) }
                    )}
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <FilterableEventTable title={ 'All Event data' }/>,
    document.getElementById('root')
);
