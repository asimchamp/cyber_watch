require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/chartview',
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, SearchManager, ChartView, Chart) {
    'use strict';

    // Make Chart available globally
    window.Chart = Chart;

    // Load Font Awesome
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');

    // Initialize toggle states
    let timeFilterVisible = true;
    let filtersVisible = true;
    let donutChartsVisible = true;

    // Handle toggle buttons
    $('#toggleTimeFilter').on('click', function() {
        const $timeFilter = $('.time-filter');
        const $button = $(this);
        
        timeFilterVisible = !timeFilterVisible;
        $button.toggleClass('active');
        
        if (timeFilterVisible) {
            $timeFilter.removeClass('hidden').css('display', '');
            $button.removeClass('active');
            $button.attr('title', 'Hide Time Filter');
        } else {
            $timeFilter.addClass('hidden');
            $button.addClass('active');
            $button.attr('title', 'Show Time Filter');
        }
    });

    $('#toggleFilters').on('click', function() {
        const $filters = $('.filters-container');
        const $button = $(this);
        
        filtersVisible = !filtersVisible;
        $button.toggleClass('active');
        
        if (filtersVisible) {
            $filters.removeClass('hidden').css('display', '');
            $button.removeClass('active');
            $button.attr('title', 'Hide Filters');
        } else {
            $filters.addClass('hidden');
            $button.addClass('active');
            $button.attr('title', 'Show Filters');
        }
    });

    $('#toggleDonutCharts').on('click', function() {
        const $donutCharts = $('.donut-charts-container');
        const $button = $(this);
        
        donutChartsVisible = !donutChartsVisible;
        $button.toggleClass('active');
        
        if (donutChartsVisible) {
            $donutCharts.removeClass('hidden').css('display', '');
            $button.removeClass('active');
            $button.attr('title', 'Hide Charts');
            // Trigger resize to redraw charts properly
            window.dispatchEvent(new Event('resize'));
        } else {
            $donutCharts.addClass('hidden');
            $button.addClass('active');
            $button.attr('title', 'Show Charts');
        }
    });

    // Track current period and pagination state
    let currentPeriod = '24h';
    let currentSearchManager = null;
    let entriesPerPage = 20;
    let allResults = [];
    let filteredResults = [];
    let currentPage = 1;

    // Get pagination elements
    const $prevPage = $('#prevPage');
    const $nextPage = $('#nextPage');
    const $currentPage = $('#currentPage');
    const $totalPages = $('#totalPages');
    const $totalEntries = $('#totalEntries');
    const $entriesPerPage = $('#entriesPerPage');
    const tableBody = $('#incidentTableBody');

    // Get filter elements
    const $incidentNumberFilter = $('#incidentNumberFilter');
    const $titleFilter = $('#titleFilter');
    const $urgencyFilter = $('#urgencyFilter');
    const $statusFilter = $('#statusFilter');
    const $ownerFilter = $('#ownerFilter');
    const $securityDomainFilter = $('#securityDomainFilter');
    const $applyFilters = $('#applyFilters');
    const $clearFilters = $('#clearFilters');

    // Add donut chart managers
    let urgencyDonutManager = null;
    let statusDonutManager = null;
    let domainDonutManager = null;
    let ruleDonutManager = null;
    let ownerDonutManager = null;

    // Function to show/hide loading
    function toggleLoading(show) {
        const loaderHtml = `
            <div class="loader">
                <div>
                    <ul>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                        <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                        </li>
                    </ul>
                </div>
                <span>Loading Notables...</span>
            </div>`;

        // Remove any existing loader
        $('.loader').remove();

        if (show) {
            // Clear table body and add loader
            tableBody.empty();
            tableBody.html(`<tr><td colspan="9" style="background: transparent; border: none;">${loaderHtml}</td></tr>`);
            // Show the loader
            $('.loader').addClass('show');
        }
    }

    // Function to format timestamp
    function formatTime(timestamp) {
        const date = new Date(timestamp * 1000); // Convert Splunk epoch to JS Date
        return date.toLocaleString();
    }

    // Function to capitalize first letter
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // Function to get urgency icon
    function getUrgencyIcon(urgency) {
        urgency = (urgency || '').toLowerCase();
        switch(urgency) {
            case 'critical':
                return '<i class="fas fa-radiation" aria-hidden="true"></i>';
            case 'high':
                return '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>';
            case 'medium':
                return '<i class="fas fa-exclamation-circle" aria-hidden="true"></i>';
            case 'low':
                return '<i class="fas fa-info-circle" aria-hidden="true"></i>';
            default:
                return '<i class="fas fa-question-circle" aria-hidden="true"></i>';
        }
    }

    // Function to create urgency class
    function getUrgencyClass(urgency) {
        urgency = (urgency || '').toLowerCase();
        switch(urgency) {
            case 'critical':
                return 'urgency-critical';
            case 'high':
                return 'urgency-high';
            case 'medium':
                return 'urgency-medium';
            case 'low':
                return 'urgency-low';
            default:
                return 'urgency-unknown';
        }
    }

    // Function to create status class
    function getStatusClass(status) {
        status = (status || '').toLowerCase();
        switch(status) {
            case 'new': return 'status-new';
            case 'in-progress': return 'status-in-progress';
            case 'pending': return 'status-pending';
            case 'closed': return 'status-closed';
            default: return '';
        }
    }

    // Function to apply filters
    function applyFilters() {
        const incidentNumber = $incidentNumberFilter.val().toLowerCase();
        const title = $titleFilter.val().toLowerCase();
        const urgency = $urgencyFilter.val().toLowerCase();
        const status = $statusFilter.val().toLowerCase();
        const owner = $ownerFilter.val().toLowerCase();
        const securityDomain = $securityDomainFilter.val().toLowerCase();

        // Filter the results
        filteredResults = allResults.filter(result => {
            // Get values from result, handling null/undefined cases
            const resultIncidentNumber = (result["Incident Number"] || '').toString().toLowerCase();
            const resultTitle = (result.Title || '').toString().toLowerCase();
            const resultUrgency = (result.Urgency || '').toString().toLowerCase();
            const resultStatus = (result.Status || '').toString().toLowerCase().replace(' ', '-'); // Normalize status
            const resultOwner = (result.Owner || '').toString().toLowerCase();
            const resultSecurityDomain = (result["Security Domain"] || '').toString().toLowerCase();

            // Apply filters with proper null checks
            const matchesIncidentNumber = !incidentNumber || resultIncidentNumber.includes(incidentNumber);
            const matchesTitle = !title || resultTitle.includes(title);
            const matchesUrgency = !urgency || resultUrgency === urgency;
            const matchesStatus = !status || resultStatus === status;
            const matchesOwner = !owner || resultOwner.includes(owner);
            const matchesSecurityDomain = !securityDomain || resultSecurityDomain === securityDomain;

            return matchesIncidentNumber && 
                   matchesTitle && 
                   matchesUrgency && 
                   matchesStatus && 
                   matchesOwner && 
                   matchesSecurityDomain;
        });

        // Update table with filtered results
        currentPage = 1;
        updateTable(null, false);

        // Update charts with filtered data
        updateChartsWithFilteredData(filteredResults);
        
        // Show success message
        showToast('Filters applied successfully', 'success');
    }

    // Function to update charts with filtered data
    function updateChartsWithFilteredData(filteredData) {
        // Update Urgency Chart
        const urgencyData = _.countBy(filteredData, 'Urgency');
        if (window.urgencyChart) {
            window.urgencyChart.data.labels = Object.keys(urgencyData);
            window.urgencyChart.data.datasets[0].data = Object.values(urgencyData);
            window.urgencyChart.update();
        }

        // Update Status Chart
        const statusData = _.countBy(filteredData, 'Status');
        if (window.statusChart) {
            window.statusChart.data.labels = Object.keys(statusData);
            window.statusChart.data.datasets[0].data = Object.values(statusData);
            window.statusChart.update();
        }

        // Update Domain Chart
        const domainData = _.countBy(filteredData, 'Security Domain');
        if (window.domainChart) {
            window.domainChart.data.labels = Object.keys(domainData);
            window.domainChart.data.datasets[0].data = Object.values(domainData);
            window.domainChart.update();
        }

        // Update Rule Chart
        const ruleData = _.countBy(filteredData, 'Rule Name');
        const sortedRules = Object.entries(ruleData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        if (window.ruleChart) {
            window.ruleChart.data.labels = sortedRules.map(([label]) => label);
            window.ruleChart.data.datasets[0].data = sortedRules.map(([,value]) => value);
            window.ruleChart.update();
        }

        // Update Owner Chart
        const ownerData = _.countBy(filteredData, 'Owner');
        if (window.ownerChart) {
            window.ownerChart.data.labels = Object.keys(ownerData);
            window.ownerChart.data.datasets[0].data = Object.values(ownerData);
            window.ownerChart.update();
        }
    }

    // Function to clear filters
    function clearFilters() {
        $incidentNumberFilter.val('');
        $titleFilter.val('');
        $urgencyFilter.val('');
        $statusFilter.val('');
        $ownerFilter.val('');
        $securityDomainFilter.val('');

        // Reset to original data
        filteredResults = allResults;
        currentPage = 1;
        
        // Update table and charts
        updateTable(null, false);
        updateChartsWithFilteredData(allResults);
        
        // Show success message
        showToast('Filters cleared successfully', 'success');
    }

    // Function to update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredResults.length / entriesPerPage);
        $currentPage.text(currentPage);
        $totalPages.text(totalPages);
        $totalEntries.text(filteredResults.length);
        
        $prevPage.prop('disabled', currentPage === 1);
        $nextPage.prop('disabled', currentPage === totalPages || totalPages === 0);
    }

    // Function to update table data
    function updateTable(results, updateAll = false) {
        if (updateAll) {
            allResults = results;
            filteredResults = results;
            currentPage = 1;
        }

        tableBody.empty();
        
        if (!filteredResults || !filteredResults.length) {
            tableBody.html('<tr><td colspan="7" class="loading">No incidents found</td></tr>');
            updatePaginationControls();
            return;
        }

        // Calculate pagination
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = Math.min(startIndex + entriesPerPage, filteredResults.length);
        const paginatedResults = filteredResults.slice(startIndex, endIndex);

        paginatedResults.forEach(function(result) {
            const rowElement = $('<tr>');
            
            // Add expand button
            const expandButton = $('<button>')
                .addClass('expand-button')
                .html('>')
                .on('click', function(e) {
                    e.stopPropagation(); // Prevent row click event
                    const button = $(this);
                    const row = button.closest('tr');
                    const expandedContent = row.next('.expanded-content');
                    
                    if (expandedContent.length) {
                        button.toggleClass('expanded');
                        expandedContent.toggleClass('visible');
                    } else {
                        button.addClass('expanded');
                        // Create expanded content
                        const expandedRow = $('<tr>').addClass('expanded-content');
                        const expandedCell = $('<td>').attr('colspan', '9');
                        
                        // Create containers for left and right sections
                        const contentContainer = $('<div>').addClass('expanded-content-container');
                        const leftSection = $('<div>').addClass('expanded-content-left');
                        const rightSection = $('<div>').addClass('expanded-content-right');
                        
                        // Rule Description Section (Left)
                        const ruleDescSection = $('<div>').addClass('expanded-section');
                        ruleDescSection.append($('<h4>').text('Rule Description'));
                        ruleDescSection.append($('<div>').addClass('content').text(result.rule_description || 'No description available'));
                        leftSection.append(ruleDescSection);
                        
                        // Notable Results Fields Section (Left)
                        const resultsSection = $('<div>').addClass('expanded-section');
                        resultsSection.append($('<h4>').text('Notable Results Fields'));
                        const resultsGrid = $('<div>').addClass('results-grid');
                        
                        // Add all results fields
                        const resultFields = Object.entries(result).filter(([key, value]) => {
                            const knownFields = ['Time', 'Incident Number', 'Title', 'Rule Name', 'Urgency', 
                                'Status', 'Owner', 'Security Domain', 'rule_description', 'cis', 'killchain', 
                                'mitreattack', 'raw_results', 'results_link'];
                            return !knownFields.includes(key) && value !== null && value !== undefined && value !== '';
                        });

                        if (resultFields.length > 0) {
                            resultFields.forEach(([key, value]) => {
                                const resultItem = $('<div>').addClass('result-item');
                                resultItem.append($('<span>').addClass('label').text(key + ':'));
                                resultItem.append($('<span>').addClass('value').text(value || 'N/A'));
                                resultsGrid.append(resultItem);
                            });
                        } else {
                            const noDataItem = $('<div>').addClass('result-item no-data');
                            noDataItem.append($('<span>').addClass('value').text('No results fields available'));
                            resultsGrid.append(noDataItem);
                        }
                        resultsSection.append(resultsGrid);
                        leftSection.append(resultsSection);
                        
                        // Additional Fields Section (Left)
                        const additionalSection = $('<div>').addClass('expanded-section');
                        additionalSection.append($('<h4>').text('Additional Fields'));
                        const additionalFields = $('<div>').addClass('additional-fields');
                        
                        // Add each additional field
                        const fields = [
                            { label: 'Security Domain', value: result['Security Domain'] },
                            { label: 'MITRE ATT&CK', value: result.mitreattack },
                            { label: 'CIS Controls', value: result.cis },
                            { label: 'Kill Chain', value: result.killchain }
                        ];
                        
                        fields.forEach(field => {
                            const fieldItem = $('<div>').addClass('field-item');
                            fieldItem.append($('<div>').addClass('label').text(field.label));
                            fieldItem.append($('<div>').addClass('value').text(field.value || 'N/A'));
                            additionalFields.append(fieldItem);
                        });
                        
                        additionalSection.append(additionalFields);
                        leftSection.append(additionalSection);

                        // Correlation Rule Results Section (Right)
                        const correlationSection = $('<div>').addClass('correlation-results-section');
                        correlationSection.append($('<h4>').text('Correlation Rule Results'));
                        
                        if (result.results_link) {
                            const link = $('<a>')
                                .addClass('correlation-link')
                                .attr('href', result.results_link)
                                .attr('target', '_blank')
                                .html('<i class="fas fa-external-link-alt"></i> View Search Results');
                            correlationSection.append(link);
                        } else {
                            correlationSection.append($('<div>').addClass('no-data').text('No correlation results available'));
                        }
                        
                        rightSection.append(correlationSection);
                        
                        // Notable Worknote Section (Right)
                        const worknoteSection = $('<div>').addClass('notable-worknote-section');
                        worknoteSection.append($('<h4>').text('Notable Worknotes'));
                        
                        // Add worknote input container
                        const worknoteInputContainer = $('<div>').addClass('worknote-input-container');
                        const textarea = $('<textarea>')
                            .addClass('worknote-textarea')
                            .attr('placeholder', 'Add your worknote here...');
                        const submitButton = $('<button>')
                            .addClass('worknote-submit')
                            .html(`
                                <div class="svg-wrapper-1">
                                    <div class="svg-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                            <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <span>Send</span>
                            `)
                            .on('click', function() {
                                const worknoteText = textarea.val().trim();
                                if (worknoteText) {
                                    addWorknote(result["Incident Number"], worknoteText)
                                        .then(() => {
                                            textarea.val('');
                                            fetchWorknotes(result["Incident Number"])
                                                .then(worknotes => {
                                                    updateWorknoteHistory(worknoteHistory, worknotes);
                                                })
                                                .catch(error => {
                                                    console.error('Error fetching worknotes:', error);
                                                    showToast('Failed to fetch worknotes', 'error');
                                                });
                                        })
                                        .catch(error => {
                                            console.error('Error adding worknote:', error);
                                            showToast('Failed to add worknote', 'error');
                                        });
                                }
                            });
                        
                        worknoteInputContainer.append(textarea);
                        worknoteInputContainer.append(submitButton);
                        worknoteSection.append(worknoteInputContainer);
                        
                        // Add worknote history container
                        const worknoteHistory = $('<div>').addClass('worknotes-history');
                        worknoteSection.append(worknoteHistory);
                        
                        // Fetch and display worknotes
                        fetchWorknotes(result["Incident Number"])
                            .then(worknotes => {
                                updateWorknoteHistory(worknoteHistory, worknotes);
                            })
                            .catch(error => {
                                console.error('Error fetching worknotes:', error);
                                worknoteHistory.html('<div class="no-worknotes">Error loading worknotes</div>');
                            });
                        
                        rightSection.append(worknoteSection);
                        
                        // Fetch and add change history to left section
                        fetchChangeHistory(result["Incident Number"])
                            .then(changes => {
                                const historySection = createChangeHistorySection(changes);
                                leftSection.append(historySection);
                            })
                            .catch(error => {
                                console.error('Error fetching change history:', error);
                            });
                        
                        // Combine all sections
                        contentContainer.append(leftSection);
                        contentContainer.append(rightSection);
                        expandedCell.append(contentContainer);
                        expandedRow.append(expandedCell);
                        row.after(expandedRow);
                        expandedRow.addClass('visible');
                    }
                });
            
            rowElement.append($('<td>').append(expandButton));
            rowElement.append($('<td>').text(formatTime(result.Time)));
            rowElement.append($('<td>').text(_.escape(result["Incident Number"])));
            rowElement.append($('<td>').text(_.escape(result.Title)));
            rowElement.append($('<td>').text(_.escape(result["Rule Name"])));
            
            // Add urgency with icon
            const urgencyValue = capitalizeFirstLetter(result.Urgency || 'Unknown');
            rowElement.append($('<td>').html(`
                <span class="${getUrgencyClass(result.Urgency)}">
                    ${getUrgencyIcon(result.Urgency)} ${_.escape(urgencyValue)}
                </span>
            `));
            
            // Add status with capitalization and dropdown
            const statusValue = capitalizeFirstLetter(result.Status || 'New');
            const statusCell = $('<td>').addClass('status-cell');
            const statusDisplay = $('<div>')
                .addClass('status-display')
                .addClass(getStatusClass(result.Status))
                .attr('data-incident', result["Incident Number"])
                .html(`<i class="fas fa-tasks"></i> ${_.escape(statusValue)}`)
                .on('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Remove any existing dropdowns
                    $('.status-dropdown-wrapper').remove();
                    
                    // Create the dropdown
                    const dropdown = $('<div>').addClass('status-dropdown-wrapper');
                    const content = $('<div>').addClass('status-dropdown-content');
                    
                    // Add status options
                    const statuses = [
                        { value: 'new', label: 'New', icon: 'fas fa-star' },
                        { value: 'in-progress', label: 'In Progress', icon: 'fas fa-spinner fa-spin' },
                        { value: 'pending', label: 'Pending', icon: 'fas fa-clock' },
                        { value: 'closed', label: 'Closed', icon: 'fas fa-check-circle' }
                    ];
                    
                    statuses.forEach(status => {
                        const option = $('<div>')
                            .addClass('status-option')
                            .addClass(`status-${status.value}`)
                            .html(`<i class="${status.icon}"></i> ${status.label}`)
                            .on('click', function(e) {
                        e.stopPropagation();
                                const newStatus = status.value;
                                const currentStatus = result.Status || 'new';
                        
                        if (currentStatus !== newStatus) {
                            updateIncidentStatus(result["Incident Number"], newStatus, currentStatus);
                        }
                        
                        dropdown.remove();
                            });
                        
                        content.append(option);
                    });
                    
                    dropdown.append(content);
                    
                    // Position the dropdown
                    const rect = statusDisplay[0].getBoundingClientRect();
                    content.css({
                        position: 'fixed',
                        top: rect.bottom + window.scrollY + 5 + 'px',
                        left: rect.left + window.scrollX + 'px'
                    });
                    
                    // Add click outside handler
                    dropdown.on('click', function(e) {
                        if ($(e.target).hasClass('status-dropdown-wrapper')) {
                            dropdown.remove();
                        }
                    });
                    
                    // Add to body and show
                    $('body').append(dropdown);
                });

            statusCell.append(statusDisplay);
            rowElement.append(statusCell);
            
            // Add owner with capitalization
            const ownerValue = capitalizeFirstLetter(result.Owner || 'Unassigned');
            const ownerCell = $('<td>').addClass('owner-cell');
            const ownerDisplay = $('<div>')
                .addClass('owner-display')
                .attr('data-incident', result["Incident Number"])
                .html(`<i class="fas fa-user"></i> ${_.escape(ownerValue)}`)
                .on('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Remove any existing dropdowns
                    $('.owner-dropdown-wrapper').remove();
                    
                    // Create the dropdown
                    const dropdown = $('<div>').addClass('owner-dropdown-wrapper');
                    const content = $('<div>').addClass('owner-dropdown-content');
                    
                    // Add "Assign to me" option
                    const assignToMeOption = $('<div>')
                        .addClass('owner-option assign-to-me')
                        .html('<i class="fas fa-user-check"></i> Assign to me')
                        .on('click', function(e) {
                            e.stopPropagation();
                            const currentOwner = result.Owner || 'Unassigned';
                            const currentUser = getCurrentUser();
                            
                            if (currentOwner !== currentUser) {
                                updateIncidentOwner(result["Incident Number"], currentUser, currentOwner);
                            }
                            
                            dropdown.remove();
                        });
                    
                    content.append(assignToMeOption);
                    
                    // Add separator
                    content.append($('<div>').addClass('owner-dropdown-separator'));
                    
                    // Get Splunk users
                    const searchManager = new SearchManager({
                        id: 'getUsers_' + Date.now(),
                        preview: false,
                        cache: false,
                        search: '| rest /services/authentication/users | table title | sort title',
                        earliest_time: '-1m',
                        latest_time: 'now'
                    });
                    
                    const userResults = searchManager.data('results');
                    userResults.on('data', function() {
                        const data = userResults.data();
                        if (data && data.rows) {
                            data.rows.forEach(row => {
                                const username = row[0];
                                const option = $('<div>')
                                    .addClass('owner-option')
                                    .text(username)
                                    .on('click', function(e) {
                                        e.stopPropagation();
                                        const currentOwner = result.Owner || 'Unassigned';
                                        
                                        if (currentOwner !== username) {
                                            updateIncidentOwner(result["Incident Number"], username, currentOwner);
                                        }
                                        
                                        dropdown.remove();
                                    });
                                
                                content.append(option);
                            });
                        }
                    });
                    
                    dropdown.append(content);
                    
                    // Position the dropdown
                    const rect = ownerDisplay[0].getBoundingClientRect();
                    content.css({
                        position: 'fixed',
                        top: rect.bottom + window.scrollY + 5 + 'px',
                        left: rect.left + window.scrollX + 'px'
                    });
                    
                    // Add click outside handler
                    dropdown.on('click', function(e) {
                        if ($(e.target).hasClass('owner-dropdown-wrapper')) {
                            dropdown.remove();
                        }
                    });
                    
                    // Add to body and show
                    $('body').append(dropdown);
                });
            
            ownerCell.append(ownerDisplay);
            rowElement.append(ownerCell);
            
            // Add security domain with capitalization
            const securityDomainValue = capitalizeFirstLetter(result["Security Domain"] || 'Unknown');
            rowElement.append($('<td>').text(_.escape(securityDomainValue)));
            
            // Make row clickable
            rowElement.on('click', function() {
                const button = $(this).find('.expand-button');
                const expandedContent = $(this).next('.expanded-content');
                
                if (expandedContent.length) {
                    button.toggleClass('expanded');
                    expandedContent.toggleClass('visible');
                }
            });
            
            tableBody.append(rowElement);
        });

        updatePaginationControls();
    }

    // Function to create or update search manager
    function createSearchManager(period) {
        // Cancel existing search if any
        if (currentSearchManager) {
            currentSearchManager.cancel();
            mvc.Components.revokeInstance(currentSearchManager.id);
        }

        const timeRange = {
            '24h': '-24h',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        // Create new search manager
        currentSearchManager = new SearchManager({
            id: `incident_search_${period}`,
            preview: false,
            cache: false,
            search: `
                search index=soc_notable sourcetype="soc_notable:log"
                | eval raw_results=results
                | eventstats count by inc_number 
                | streamstats count by inc_number 
                | eval non_count = (count - 1) 
                | eval inc_number=if(count > 1, inc_number . "-" . non_count, inc_number) 
                | table _time, inc_number, title, search_name, severity, security_domain, rule_description, cis, killchain, mitreattack, raw_results, results_link, results.*
                | rename "results.*" as "*", _time as Time,
                | append [| search index="soc_summary"
                | stats latest(status) as status latest(owner) as owner by inc_number]
                | stats values(status) as status values(owner) as owner values(*) as * by inc_number
                | fillnull value=new status 
                | fillnull value=unassigned owner 
                | table Time, inc_number, title, search_name, severity, status, owner, security_domain, rule_description, cis, killchain, mitreattack, raw_results, results_link *
                | rename inc_number as "Incident Number", title as Title, search_name as "Rule Name", severity as Urgency, status as Status, owner as Owner, security_domain as "Security Domain"
                | sort - Time "Incident Number"
            `,
            earliest_time: timeRange,
            latest_time: 'now',
            status_buckets: 0,
            output_mode: 'json_rows',
            count: 0  // Set count to 0 to get all results
        });

        // Show loading state
        toggleLoading(true);

        // Get the results with explicit count=0
        const results = currentSearchManager.data('results', { 
            output_mode: 'json_rows', 
            count: 0  // Explicitly set count to 0 here as well
        });

        // Handle results
        results.on('data', function() {
            const data = results.data();
            if (data && data.rows) {
                const formattedResults = data.rows.map(row => {
                    const obj = {};
                    data.fields.forEach((field, i) => {
                        obj[field] = row[i];
                    });
                    return obj;
                });
                updateTable(formattedResults, true);
            }
            toggleLoading(false);
        });

        // Handle errors
        currentSearchManager.on('error', function(err) {
            console.error('Search failed:', err);
            tableBody.html('<tr><td colspan="7" class="loading">Error loading incidents</td></tr>');
            toggleLoading(false);
        });

        return currentSearchManager;
    }

    // Handle time filter buttons
    $('.time-btn').on('click', function() {
        const period = $(this).data('period');
        $('.time-btn').removeClass('active');
        $(this).addClass('active');
        
        currentPeriod = period;
        createSearchManager(period);
        updateDonutCharts(period);
    });

    // Handle pagination controls
    $prevPage.on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updateTable(null, false);
        }
    });

    $nextPage.on('click', function() {
        const totalPages = Math.ceil(filteredResults.length / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable(null, false);
        }
    });

    // Handle entries per page change
    $entriesPerPage.on('change', function() {
        entriesPerPage = parseInt($(this).val(), 10);
        currentPage = 1;
        updateTable(null, false);
    });

    // Handle filter actions
    $applyFilters.on('click', applyFilters);
    $clearFilters.on('click', clearFilters);

    // Initial load
    createSearchManager(currentPeriod);

    // Add new function for tracking status changes
    function logStatusChange(incidentNumber, oldStatus, newStatus, username) {
        const timestamp = Math.floor(new Date().getTime() / 1000);
        
        const logManager = new SearchManager({
            id: 'logChange_' + Date.now(),
            preview: false,
            cache: false,
            search: `| makeresults 
            | eval 
                _time=now(),
                incident_number="${incidentNumber}",
                field_changed="status",
                old_value="${oldStatus}",
                new_value="${newStatus}",
                changed_by="${username}",
                change_time=${timestamp}
            | collect index=soc_summary sourcetype=incident_changes
            | sendalert track_changes param.change_type="Status Update"`,
            earliest_time: '-5m',
            latest_time: 'now'
        });

        logManager.on('error', function(err) {
            console.error('Error logging change:', err);
        });
    }

    // Function to get current username
    function getCurrentUser() {
        return Splunk.util.getConfigValue('USERNAME') || 'unknown_user';
    }

    // Function to fetch change history
    function fetchChangeHistory(incidentNumber) {
        return new Promise((resolve, reject) => {
            const historyManager = new SearchManager({
                id: 'fetchHistory_' + Date.now(),
                preview: false,
                cache: false,
                search: `search index=soc_summary sourcetype=incident_changes incident_number="${incidentNumber}"
                | sort -change_time
                | table change_time, field_changed, old_value, new_value, changed_by`,
                earliest_time: '-30d',
                latest_time: 'now'
            });

            const results = historyManager.data('results', {
                output_mode: 'json_rows',
                count: 0
            });

            results.on('data', function() {
                const data = results.data();
                resolve(data.rows || []);
            });

            results.on('error', function(err) {
                console.error('Error fetching history:', err);
                reject(err);
            });
        });
    }

    // Function to create change history section
    function createChangeHistorySection(changes) {
        const historySection = $('<div>').addClass('expanded-section change-history-section');
        historySection.append($('<h4>').text('Change History'));
        
        const historyContent = $('<div>').addClass('change-history-content');
        
        if (changes && changes.length > 0) {
            const historyTable = $('<table>').addClass('change-history-table');
            historyTable.append(`
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Field</th>
                        <th>Old Value</th>
                        <th>New Value</th>
                        <th>Changed By</th>
                    </tr>
                </thead>
            `);
            
            const tbody = $('<tbody>');
            changes.forEach(change => {
                const row = $('<tr>');
                row.append($('<td>').text(formatTime(change[0])));
                row.append($('<td>').text(capitalizeFirstLetter(change[1])));
                row.append($('<td>').text(capitalizeFirstLetter(change[2])));
                row.append($('<td>').text(capitalizeFirstLetter(change[3])));
                row.append($('<td>').text(change[4]));
                tbody.append(row);
            });
            
            historyTable.append(tbody);
            historyContent.append(historyTable);
        } else {
            historyContent.append($('<div>').addClass('no-history').text('No changes recorded'));
        }
        
        historySection.append(historyContent);
        return historySection;
    }

    // Update the updateIncidentStatus function
    function updateIncidentStatus(incidentNumber, newStatus, currentStatus) {
        const username = getCurrentUser();
        
        // Show loading toast
        showToast('Updating status...', 'info');
        
        // Create search manager for status update
        const updateManager = new SearchManager({
            id: 'updateStatus_' + Date.now(),
            preview: false,
            cache: false,
            search: `| makeresults | eval _time=now(), inc_number="${incidentNumber}", status="${newStatus}", last_updated=now(), last_updated_by="${username}"
            | collect index=soc_summary sourcetype=notable_changes
            | sendalert notable param.rule_title="Status Update" param.security_domain="Status Change"`,
            earliest_time: '-1m',
            latest_time: 'now'
        });

        // Get the results
        const results = updateManager.data('results');

            showToast('Status updated successfully', 'success');
        setTimeout(function() {
            window.location.reload();
        }, 3000);
        

        results.on('error', function(err) {
            showToast('Failed to update status', 'error');
        });
    }

    // Add toast notification function if not already present
    function showToast(message, type = 'info') {
        // Remove existing toasts
        $('.toast').remove();
        
        const toast = $('<div>')
            .addClass('toast')
            .addClass(`toast-${type}`)
            .text(message);
        
        $('body').append(toast);
        
        setTimeout(() => {
            toast.addClass('show');
            setTimeout(() => {
                toast.removeClass('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    // Remove the old document click handler as it's no longer needed
    $(document).off('click.statusDropdown');

    // Add function to update owner
    function updateIncidentOwner(incidentNumber, newOwner, currentOwner) {
        const username = getCurrentUser();
        
        // Show loading toast
        showToast('Updating owner...', 'info');
        
        // Create search manager for owner update
        const updateManager = new SearchManager({
            id: 'updateOwner_' + Date.now(),
            preview: false,
            cache: false,
            search: `| makeresults | eval _time=now(), inc_number="${incidentNumber}", owner="${newOwner}", last_updated=now(), last_updated_by="${username}"
            | collect index=soc_summary sourcetype=notable_changes
            | sendalert notable param.rule_title="Owner Update" param.security_domain="Owner Change"`,
            earliest_time: '-1m',
            latest_time: 'now'
        });

        // Get the results
        const results = updateManager.data('results');

        showToast('Owner updated successfully', 'success');
        setTimeout(function() {
            window.location.reload();
        }, 3000);

        results.on('error', function(err) {
            showToast('Failed to update owner', 'error');
        });
    }

    // Function to add a worknote
    function addWorknote(incidentNumber, worknoteText) {
        const username = getCurrentUser();
        const timestamp = Math.floor(new Date().getTime() / 1000);
        
        return new Promise((resolve, reject) => {
            const worknoteManager = new SearchManager({
                id: 'addWorknote_' + Date.now(),
                preview: false,
                cache: false,
                search: `| makeresults 
                | eval 
                    _time=now(),
                    incident_number="${incidentNumber}",
                    worknote="${worknoteText}",
                    username="${username}",
                    timestamp=${timestamp}
                | collect index=soc_summary sourcetype=incident_worknotes
                | sendalert track_worknotes param.note_type="User Note"`,
                earliest_time: '-1m',
                latest_time: 'now'
            });

            const results = worknoteManager.data('results');

            showToast('Worknote added successfully, Page Reloading...', 'success');
            setTimeout(function() {
                window.location.reload();
            }, 3000);

                results.on('data', function() {
                showToast('Worknote added successfully', 'success');
                resolve();
            });

            results.on('error', function(err) {
                console.error('Error adding worknote:', err);
                reject(err);
            });
        });
    }

    // Function to fetch worknotes
    function fetchWorknotes(incidentNumber) {
        return new Promise((resolve, reject) => {
            const worknoteManager = new SearchManager({
                id: 'fetchWorknotes_' + Date.now(),
                preview: false,
                cache: false,
                search: `search index=soc_summary sourcetype=incident_worknotes incident_number="${incidentNumber}"
                | sort -timestamp
                | table timestamp, username, worknote`,
                earliest_time: '-30d',
                latest_time: 'now'
            });

            const results = worknoteManager.data('results', {
                output_mode: 'json_rows',
                count: 0
            });

            results.on('data', function() {
                const data = results.data();
                resolve(data.rows || []);
            });

            results.on('error', function(err) {
                console.error('Error fetching worknotes:', err);
                reject(err);
            });
        });
    }

    // Function to update worknote history display
    function updateWorknoteHistory(container, worknotes) {
        container.empty();
        
        if (worknotes && worknotes.length > 0) {
            worknotes.forEach(worknote => {
                const entry = $('<div>').addClass('worknote-entry');
                const header = $('<div>').addClass('worknote-header');
                
                const user = $('<div>')
                    .addClass('worknote-user')
                    .html(`<i class="fas fa-user"></i> ${_.escape(worknote[1])}`);
                
                const timestamp = $('<div>')
                    .addClass('worknote-timestamp')
                    .text(formatTime(worknote[0]));
                
                header.append(user);
                header.append(timestamp);
                
                const content = $('<div>')
                    .addClass('worknote-content')
                    .text(worknote[2]);
                
                entry.append(header);
                entry.append(content);
                container.append(entry);
            });
        } else {
            container.html('<div class="no-worknotes">No worknotes available</div>');
        }
    }

    // Function to update donut charts
    function updateDonutCharts(period) {
        const timeRange = {
            '24h': '-24h',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        // Helper function to safely get canvas context
        function getChartContext(elementId) {
            const canvas = document.getElementById(elementId);
            if (!canvas) {
                console.error(`Canvas element ${elementId} not found`);
                return null;
            }
            return canvas.getContext('2d');
        }

        // Helper function to create chart configuration
        function createChartConfig(labels, data, colors) {
            const total = data.reduce((a, b) => a + b, 0);
            return {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#2d3436',
                            bodyColor: '#2d3436',
                            borderColor: '#e1e1e1',
                            borderWidth: 1,
                            padding: 10,
                            boxPadding: 5,
                            usePointStyle: true,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: function(chart) {
                        const ctx = chart.ctx;
                        const width = chart.width;
                        const height = chart.height;
                        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                        // Calculate the center position based on the chart area
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;
                        const radius = 40;

                        // Clear the center area
                        ctx.save();
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.restore();

                        // Draw total text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // Draw "Total" text
                        ctx.font = '14px Arial';
                        ctx.fillStyle = '#2d3436';
                        ctx.fillText('Total', centerX, centerY - 10);
                        
                        // Draw total number
                        ctx.font = 'bold 20px Arial';
                        ctx.fillStyle = '#2d3436';
                        ctx.fillText(total.toString(), centerX, centerY + 10);
                    }
                }]
            };
        }

        // Initialize chart containers with canvas elements
        ['urgencyDonut', 'statusDonut', 'domainDonut', 'ruleDonut', 'ownerDonut'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<canvas></canvas>';
            }
        });

        // Urgency Donut Chart
        if (urgencyDonutManager) {
            urgencyDonutManager.cancel();
            mvc.Components.revokeInstance(urgencyDonutManager.id);
        }
        urgencyDonutManager = new SearchManager({
            id: `urgency_donut_${period}`,
            preview: false,
            cache: false,
            search: `search index=soc_notable earliest=${timeRange} | stats count by severity | rename severity as label count as value | sort - value`,
            earliest_time: timeRange,
            latest_time: 'now'
        });

        const urgencyResults = urgencyDonutManager.data('results');
        urgencyResults.on('data', function() {
            const data = urgencyResults.data();
            if (data && data.rows) {
                const labels = data.rows.map(row => row[0]);
                const values = data.rows.map(row => parseInt(row[1]));
                const colors = ['#ff6b81', '#19c22d', '#bf0d0d', '#1e90ff'];
                
                const canvas = document.querySelector('#urgencyDonut canvas');
                if (canvas) {
                    if (window.urgencyChart) {
                        window.urgencyChart.destroy();
                    }
                    window.urgencyChart = new Chart(canvas, createChartConfig(labels, values, colors));
                }
            }
        });

        // Status Donut Chart
        if (statusDonutManager) {
            statusDonutManager.cancel();
            mvc.Components.revokeInstance(statusDonutManager.id);
        }
        statusDonutManager = new SearchManager({
            id: `status_donut_${period}`,
            preview: false,
            cache: false,
            search: `search index=soc_notable earliest=${timeRange} | search NOT [ search index=soc_summary sourcetype=notable_changes | stats count by inc_number | fields - count] | append [| search index="soc_summary" | stats latest(status) as status by inc_number] | stats count by status | rename status as label count as value | sort - value`,
            earliest_time: timeRange,
            latest_time: 'now'
        });

        const statusResults = statusDonutManager.data('results');
        statusResults.on('data', function() {
            const data = statusResults.data();
            if (data && data.rows) {
                const labels = data.rows.map(row => row[0]);
                const values = data.rows.map(row => parseInt(row[1]));
                const colors = ['#2ecc71', '#3498db', '#f1c40f', '#95a5a6'];
                
                const canvas = document.querySelector('#statusDonut canvas');
                if (canvas) {
                    if (window.statusChart) {
                        window.statusChart.destroy();
                    }
                    window.statusChart = new Chart(canvas, createChartConfig(labels, values, colors));
                }
            }
        });

        // Domain Donut Chart
        if (domainDonutManager) {
            domainDonutManager.cancel();
            mvc.Components.revokeInstance(domainDonutManager.id);
        }
        domainDonutManager = new SearchManager({
            id: `domain_donut_${period}`,
            preview: false,
            cache: false,
            search: `search index=soc_notable earliest=${timeRange} | stats count by security_domain | rename security_domain as label count as value | sort - value`,
            earliest_time: timeRange,
            latest_time: 'now'
        });

        const domainResults = domainDonutManager.data('results');
        domainResults.on('data', function() {
            const data = domainResults.data();
            if (data && data.rows) {
                const labels = data.rows.map(row => row[0]);
                const values = data.rows.map(row => parseInt(row[1]));
                const colors = ['#9b59b6', '#34495e', '#16a085', '#d35400', '#7f8c8d'];
                
                const canvas = document.querySelector('#domainDonut canvas');
                if (canvas) {
                    if (window.domainChart) {
                        window.domainChart.destroy();
                    }
                    window.domainChart = new Chart(canvas, createChartConfig(labels, values, colors));
                }
            }
        });

        // Rule Donut Chart
        if (ruleDonutManager) {
            ruleDonutManager.cancel();
            mvc.Components.revokeInstance(ruleDonutManager.id);
        }
        ruleDonutManager = new SearchManager({
            id: `rule_donut_${period}`,
            preview: false,
            cache: false,
            search: `search index=soc_notable earliest=${timeRange} | stats count by search_name | rename search_name as label count as value | sort - value | head 5`,
            earliest_time: timeRange,
            latest_time: 'now'
        });

        const ruleResults = ruleDonutManager.data('results');
        ruleResults.on('data', function() {
            const data = ruleResults.data();
            if (data && data.rows) {
                const labels = data.rows.map(row => row[0]);
                const values = data.rows.map(row => parseInt(row[1]));
                const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#95a5a6'];
                
                const canvas = document.querySelector('#ruleDonut canvas');
                if (canvas) {
                    if (window.ruleChart) {
                        window.ruleChart.destroy();
                    }
                    window.ruleChart = new Chart(canvas, createChartConfig(labels, values, colors));
                }
            }
        });

        // Owner Donut Chart
        if (ownerDonutManager) {
            ownerDonutManager.cancel();
            mvc.Components.revokeInstance(ownerDonutManager.id);
        }
        ownerDonutManager = new SearchManager({
            id: `owner_donut_${period}`,
            preview: false,
            cache: false,
            search: `search index=soc_notable earliest=${timeRange} 
                    | search NOT [ search index=soc_summary sourcetype=notable_changes 
                    | stats count by inc_number 
                    | fields - count] 
                    | append [| search index="soc_summary" 
                    | stats latest(owner) as owner by inc_number] 
                    | stats count by owner 
                    | rename owner as label count as value 
                    | fillnull value="Unassigned" label 
                    | sort - value`,
            earliest_time: timeRange,
            latest_time: 'now'
        });

        const ownerResults = ownerDonutManager.data('results');
        ownerResults.on('data', function() {
            const data = ownerResults.data();
            if (data && data.rows) {
                const labels = data.rows.map(row => row[0]);
                const values = data.rows.map(row => parseInt(row[1]));
                const colors = ['#e84393', '#00b894', '#0984e3', '#6c5ce7', '#fdcb6e', '#00cec9'];
                
                const canvas = document.querySelector('#ownerDonut canvas');
                if (canvas) {
                    if (window.ownerChart) {
                        window.ownerChart.destroy();
                    }
                    window.ownerChart = new Chart(canvas, createChartConfig(labels, values, colors));
                }
            }
        });
    }

    // Wait for DOM to be fully loaded
    $(document).ready(function() {
        // Initialize with default period (24h)
        updateDonutCharts('24h');
    });

    // Add keyup event handlers for text inputs with debounce
    let filterTimeout;
    $('.filter-input').on('keyup', function(e) {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            applyFilters();
        }, 500);
    });

    // Add change event handlers for select inputs
    $('.filter-select').on('change', function() {
        applyFilters();
    });
}); 