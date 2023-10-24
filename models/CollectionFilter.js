export default class CollectionFilter {
    constructor(data, params, model) {
        this.data = data;
        this.params = params;
        this.model = model;
    }


    filter() {
        // Implement filtering logic based on filter parameters
        let filteredData = this.data;
        let params = this.params;


        for (const filterName in params) {
            let filterValue = params[filterName];
            let searchValue;
            if (filterName !== "limit" && filterName !== "offset" && filterName !== "sort" && filterName !== "field")
            {
                if (filterValue !== undefined && filterName in this.data[0]) {
                    
                    if (filterValue.startsWith('*') && filterValue.endsWith('*')) {
                        // Contains pattern: *ab*
                        searchValue = filterValue.slice(1, -1);
                        filteredData = filteredData.filter(item => item[filterName].includes(searchValue));
                    } else if (filterValue.startsWith('*')) {
                        // Ends with pattern: *ab
                        searchValue = filterValue.slice(1);
                        filteredData = filteredData.filter(item => item[filterName].endsWith(searchValue));
                    } else if (filterValue.endsWith('*')) {
                        // Starts with pattern: ab*
                        searchValue = filterValue.slice(0, -1);
                        filteredData = filteredData.filter(item => item[filterName].startsWith(searchValue));
                    } else {
                        // Exact match
                        filteredData = filteredData.filter(item => item[filterName] === filterValue);
                    }
                }
                else {
                    filteredData = [];
                }
            }
        }

        this.data = filteredData;
    }
    sort() {
        let sortedData = this.data;

        if ('sort' in this.params) {
            let sortField;
            let sortOrder;

            if (this.params.sort.includes(','))
                [sortField, sortOrder] = this.params.sort.split(',');
            else
                [sortField, sortOrder] = [this.params.sort, 'asc'];


            if (sortOrder == 'desc')
                sortedData = sortedData.sort((a, b) => a[sortField] > b[sortField] ? -1 : 1);
            else
                sortedData = sortedData.sort((a, b) => a[sortField] < b[sortField] ? -1 : 1);

        }

        this.data = sortedData;
    }

    paginate() {
        let paginatedData = this.data;
        // Implement pagination logic based on query parameters
        // For example, use this.params.limit and this.params.offset
        if ("limit" in this.params && "offset" in this.params) {
            let limit = this.params.limit;
            let offset = this.params.offset;
            if (!isNaN(limit) && !isNaN(offset)) {
                if (parseInt(offset) >= 0 && parseInt(limit) >= 0)
                    paginatedData = this.data.slice(offset, limit + offset);
                else {
                    this.model.addError(`The value [${offset}] or [${limit}] are not positive number.`);
                }
            }
            else {
                this.model.addError(`The value [${limit}] or [${offset}] are not numbers.`);
            }
        }

        this.data = paginatedData;
    }

    get() {
        // Apply filtering, sorting, and pagination based on query parameters
        this.filter();
        this.sort();
        this.paginate();

        if (this.model.state.isValid) {
            return this.data;
        }
        // You can return both the paginated data and pagination information
        return this.model.state.errors;
    }
    getKeyByValue(object, value) {
        return Object.keys(object).find(key === value);
    }
    valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
}
