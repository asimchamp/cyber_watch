require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/utils',
    'bootstrap.modal'
], function(
    $,
    _,
    mvc,
    SearchManager,
    TableView,
    utils
) {
    // Variables for Load More functionality
    let displayedRules = 10;  // Number of rules to show initially and each time Load More is clicked
    let currentlyDisplayed = 0;
    let allRules = [];

    // Initialize variables for pagination
    let offset = 0;
    const limit = 10;
    let totalCount = 0;
    let displayedCount = 0;

    // Load Font Awesome
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');

    // Create the search manager
    var correlationRulesSearch = new SearchManager({
        id: 'correlationRulesSearch',
        search: '| rest /servicesNS/-/-/saved/searches \
                | search action.correlationsearch.enabled=1 \
                | table title description cron_schedule disabled \
                       action.correlationsearch.label \
                       action.socnotable.param.severity \
                       action.socnotable.param.security_domain \
                       action.socnotable.param.group \
                       action.socnotable.param.status \
                       search \
                | rename title as "Rule Name" \
                       description as "Description" \
                       action.socnotable.param.severity as "Severity" \
                       cron_schedule as "Schedule" \
                       disabled as "Status" \
                | eval Status=if(Status="1", "Disabled", "Enabled") \
                | eval Severity=coalesce(Severity, "low") \
                | eval "Security Domain"=coalesce(action.socnotable.param.security_domain, "endpoint") \
                | eval Group=coalesce(action.socnotable.param.group, "correlation") \
                | eval Severity=upper(substr(Severity,1,1)).substr(Severity,2)',
        earliest_time: '0',
        latest_time: 'now',
        autostart: true,
        preview: false,
        cache: false
    });

    // Get the results
    var myResults = correlationRulesSearch.data('results', { 
        output_mode: 'json', 
        count: 0 
    });
    
    // Handle the results
    myResults.on('data', function() {
        const data = myResults.data().results;
        allRules = data.map(result => ({
            'Rule Name': result['Rule Name'],
            'Description': result['Description'],
            'Severity': result['Severity'],
            'Schedule': result['Schedule'],
            'Status': result['Status'],
            'Search Query': result['Search Query'],
        }));
        updateTable(false);
    });

    // Add loading state
    correlationRulesSearch.on('search:start', function() {
        console.log('Search started');
        $('#rulesTableBody').html(`
            <tr>
                <td colspan="6" class="text-center">
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
                        <span>Loading Rules...</span>
                    </div>
                </td>
            </tr>
        `);
        $('.loader').addClass('show');
        $('#messageContainer').empty();
    });

    // Add error handling
    correlationRulesSearch.on('search:error', function(err) {
        console.error('Search error:', err);
        $('.loader').removeClass('show');
        $('#messageContainer').html(
            '<div class="alert alert-error">' +
            '<i class="icon-alert"></i> Error loading correlation rules: ' + err.message +
            '</div>'
        );
    });

    // Load More button click handler
    $('#loadMoreBtn').on('click', function() {
        console.log('Load More clicked');
        updateTable(true);
    });

    // Function to update table with loaded data
    function updateTable(isLoadMore = false) {
        if (!allRules || !allRules.length) {
            $('.loader').removeClass('show');
            $('#messageContainer').html(
                '<div class="alert alert-error">' +
                '<i class="icon-alert"></i> No correlation rules found.' +
                '</div>'
            );
            $('#rulesTableBody').empty();
            $('#displayedCount').text('0');
            $('#totalCount').text('0');
            $('#loadMoreBtn').prop('disabled', true);
            return;
        }

        // If not loading more, clear the table and reset counter
        if (!isLoadMore) {
            $('#rulesTableBody').empty();
            currentlyDisplayed = 0;
        }

        const endIndex = Math.min(currentlyDisplayed + displayedRules, allRules.length);
        const newRules = allRules.slice(currentlyDisplayed, endIndex);

        newRules.forEach(function(rule) {
            const row = createTableRow(rule);
            $('#rulesTableBody').append(row);
        });

        currentlyDisplayed = endIndex;

        // Update counts and button state
        $('#displayedCount').text(currentlyDisplayed);
        $('#totalCount').text(allRules.length);
        
        // Update Load More button visibility and state
        if (currentlyDisplayed >= allRules.length) {
            $('#loadMoreBtn').hide();
        } else {
            $('#loadMoreBtn').show().prop('disabled', false);
        }

        // Hide loader and clear any error messages
        $('.loader').removeClass('show');
        $('#messageContainer').empty();
    }

    // Function to create a severity badge
    function createSeverityBadge(severity) {
        severity = severity ? severity.toLowerCase() : 'low';
        return `<span class="severity-badge severity-${severity}">${severity}</span>`;
    }

    // Function to create a status badge
    function createStatusBadge(status) {
        const statusLower = status.toLowerCase();
        return `<span class="status-badge status-${statusLower}">${status}</span>`;
    }

    // Function to create edit button
    function createEditButton(ruleName) {
        return $('<button>')
            .addClass('edit-button')
            .attr('data-rule-name', ruleName)
            .html(`
                <svg class="edit-svgIcon" viewBox="0 0 512 512">
                    <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                </svg>
            `);
    }

    // Function to create table row
    function createTableRow(rule) {
        const row = $('<tr>').data('rule-data', rule);
        
        // Add cells for each column
        row.append($('<td>').text(rule['Rule Name']));
        row.append($('<td>').text(rule['Description']));
        row.append($('<td>').html(createSeverityBadge(rule['Severity'])));
        row.append($('<td>').text(rule['Schedule']));
        
        // Add toggle button (Status)
        const toggleCell = $('<td>').addClass('text-center').css('width', '150px');
        const toggleButton = $('<label>')
            .addClass('switch-button')
            .attr('for', `switch-${rule['Rule Name'].replace(/\s+/g, '-')}`)
            .html(`
                <div class="switch-outer">
                    <input type="checkbox" id="switch-${rule['Rule Name'].replace(/\s+/g, '-')}" 
                        ${rule['Status'].toLowerCase() === 'enabled' ? 'checked' : ''}>
                    <div class="button">
                        <span class="button-toggle"></span>
                        <span class="button-indicator"></span>
                    </div>
                </div>
            `);
        
        // Add click handler to the checkbox
        toggleButton.find('input[type="checkbox"]').on('change', function(e) {
            e.preventDefault();
            const button = $(this).closest('.switch-button');
            if (button.hasClass('processing')) return;
            
            button.addClass('processing');
            const searchName = rule['Rule Name'];
            const currentState = this.checked ? 'enabled' : 'disabled';
            
            // First, get the current configuration
            $.ajax({
                url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/saved/searches/${encodeURIComponent(searchName)}`),
                method: 'GET',
                data: {
                    output_mode: 'json'
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(function(response) {
                // Prepare the update data
                const updateData = {
                    'disabled': currentState === 'enabled' ? '0' : '1',
                    'output_mode': 'json'
                };
                
                // Update the saved search
                return $.ajax({
                    url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/saved/searches/${encodeURIComponent(searchName)}`),
                    method: 'POST',
                    data: updateData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
            })
            .then(function() {
                showMessage('success', `Rule ${currentState} successfully`);
                // Refresh the table to reflect the changes
                correlationRulesSearch.startSearch();
            })
            .catch(function(error) {
                console.error('Failed to toggle rule:', error);
                showMessage('error', 'Failed to toggle rule status');
                // Revert checkbox state on error
                $(e.target).prop('checked', !$(e.target).prop('checked'));
            })
            .always(function() {
                button.removeClass('processing');
            });
        });
        
        toggleCell.append(toggleButton);
        row.append(toggleCell);
        
        // Add edit button
        const actionCell = $('<td>').addClass('text-center').css('width', '100px');
        actionCell.append(createEditButton(rule['Rule Name']));
        row.append(actionCell);
        
        return row;
    }
    

    // Document ready handler
    $(document).ready(function() {
        // Save button click handler for edit modal
        $(document).on('click', '#saveRuleChanges', function(e) {
            e.preventDefault();
            $('#editRuleForm').submit();
        });

        // Initialize schedule type change handler for edit modal
    $('#editScheduleType').on('change', function() {
        const selectedType = $(this).val();
        const cronContainer = $('#editCronSchedule');
        if (selectedType === 'cron') {
            cronContainer.show();
        } else {
            cronContainer.hide();
            }
        });
    });

    // Function to fetch rule details for editing
    function fetchRuleDetails(ruleName) {
        console.log('Fetching rule details for:', ruleName);
        
        // Following .cursorrules - Service Health Check
            if (!ruleName) {
            console.error('Rule name is undefined');
            showMessage('error', 'Failed to fetch rule details: Rule name is missing');
                return;
            }

        // Show loading state
        $('#editRuleModal .modal-body').addClass('loading');
        $('#editRuleModal').modal();

        // Fetch rule details directly using REST API
            $.ajax({
            url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/saved/searches/${encodeURIComponent(ruleName)}`),
                method: 'GET',
                data: {
                    output_mode: 'json'
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function(response) {
                try {
                    const ruleData = response.entry[0];
                    const content = ruleData.content;
                    console.log('Rule data fetched:', content);

                    // Basic Information
                    $('#editSearchName').val(ruleData.name);
                    $('#editDescription').val(content.description || '');
                    $('#editSearch').val(content.search || '');
                    $('#editSecurityDomain').val(content['action.socnotable.param.security_domain'] || 'endpoint');
                    $('#editSeverity').val(content['action.socnotable.param.severity'] || 'low');
                    
                    // Schedule
                    const scheduleType = content.cron_schedule.includes('*') ? 'cron' : 'realtime';
                    $('#editScheduleType').val(scheduleType);
                    $('#editCronExpression').val(content.cron_schedule || '*/5 * * * *');
                    $('#editCronSchedule').toggle(scheduleType === 'cron');

                    // Annotations
                    $('#editMitreAttack').val(content['action.socnotable.param.mitreattack'] || '');
                    $('#editKillChain').val(content['action.socnotable.param.killchain'] || '');
                    $('#editCis20').val(content['action.socnotable.param.cis'] || '');
                    $('#editNotableTitleField').val(content['action.socnotable.param.notable_title_field'] || '');

                    console.log('Form fields populated successfully');
                } catch (error) {
                    console.error('Error populating form fields:', error);
                    showMessage('error', 'Error populating form fields: ' + error.message);
                }
                },
                error: function(xhr, status, error) {
                    console.error('Failed to fetch rule details:', error);
                    showMessage('error', 'Failed to load rule details: ' + error);
            },
            complete: function() {
                // Remove loading state
                $('#editRuleModal .modal-body').removeClass('loading');
            }
        });
    }

    // Helper function to show messages
    function showMessage(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        const icon = type === 'success' ? 'icon-check' : 'icon-alert';
        $('#messageContainer').html(
            `<div class="alert ${alertClass}">` +
            `<i class="${icon}"></i> ${message}` +
            '</div>'
        );
    }

    // Handle edit form submission
    $('#editRuleForm').on('submit', function(e) {
        e.preventDefault();
        const saveBtn = $('#editSaveBtn');
        saveBtn.addClass('is-loading').prop('disabled', true);

        const formData = {
            name: $('#editSearchName').val(),
            description: $('#editDescription').val(),
            search: $('#editSearch').val(),
            security_domain: $('#editSecurityDomain').val(),
            severity: $('#editSeverity').val().toLowerCase(),
            schedule_type: $('#editScheduleType').val(),
            cron_schedule: $('#editScheduleType').val() === 'cron' ? $('#editCronExpression').val() : '*/5 * * * *',
            mitreAttack: $('#editMitreAttack').val().trim(),
            killChain: $('#editKillChain').val().trim(),
            cis20: $('#editCis20').val().trim(),
            notableTitleField: $('#editNotableTitleField').val().trim()
        };

        // Map severity to numeric values
        const severityMap = {
            'low': 1,
            'medium': 3,
            'high': 5,
            'critical': 6
        };

        // First enable the alert action
        $.ajax({
            url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/alerts/alert_actions/socnotable`),
            method: 'POST',
            data: {
                'param.rule_title': formData.name,
                'action.socnotable': '1',
                'output_mode': 'json'
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(function() {
            // Then update the saved search
            const updateData = {
                'search': formData.search,
                'description': formData.description,
                'is_scheduled': '1',
                'cron_schedule': formData.cron_schedule,
                'dispatch.earliest_time': '-24h',
                'dispatch.latest_time': 'now',
                'actions': 'socnotable',
                'alert.severity': severityMap[formData.severity],
                'alert.suppress': '0',
                'alert.track': '1',
                'action.correlationsearch.enabled': '1',
                'action.correlationsearch.label': formData.name,
                'action.script': '1',
                'action.script.param.description': formData.description,
                'action.script.param.rule_name': formData.name,
                'action.script.param.severity': formData.severity,
                'action.socnotable.param.rule_title': formData.name,
                'action.socnotable.param.rule_description': formData.description,
                'action.socnotable.param.security_domain': formData.security_domain,
                'action.socnotable.param.severity': formData.severity,
                'action.socnotable.param.status': 'new',
                'action.socnotable.param.group': 'correlation',
                'action.socnotable.param.mitreattack': formData.mitreAttack,
                'action.socnotable.param.killchain': formData.killChain,
                'action.socnotable.param.cis': formData.cis20,
                'action.socnotable.param.notable_title_field': formData.notableTitleField,
                'output_mode': 'json'
            };

            // Use the rule name from the form for the URL
            const ruleName = $('#editSearchName').val();
            if (!ruleName) {
                throw new Error('Rule name is required');
            }

            return $.ajax({
                url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/saved/searches/${encodeURIComponent(ruleName)}`),
                method: 'POST',
                data: updateData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        })
        .then(function(response) {
            console.log('Rule updated successfully:', response);
            $('#editRuleModal').modal('hide');
            showMessage('success', 'Rule updated successfully');
                // Refresh the table
                correlationRulesSearch.startSearch();
        })
        .catch(function(xhr, status, error) {
            console.error('Failed to update rule:', error);
            let errorMsg = 'Failed to update rule';
                try {
                    if (xhr.responseText) {
                        const errorResponse = JSON.parse(xhr.responseText);
                    errorMsg = errorResponse.messages[0].text || errorMsg;
                    }
                } catch(e) {}
            showMessage('error', errorMsg);
        })
        .always(function() {
            saveBtn.removeClass('is-loading').prop('disabled', false);
        });
    });

    // Add click handler for edit buttons
    $(document).on('click', '.edit-button', function() {
        const ruleName = $(this).data('rule-name');
        fetchRuleDetails(ruleName);
    });

    // Add search and filter functionality
    function filterRules() {
        const searchText = $('#ruleSearch').val().toLowerCase();
        const statusFilter = $('#statusFilter').val();
        
        const filteredRules = allRules.filter(rule => {
            const matchesSearch = (rule['Rule Name'].toLowerCase().includes(searchText) || 
                                 rule['Description'].toLowerCase().includes(searchText));
            const matchesStatus = statusFilter === 'all' || rule['Status'].toLowerCase() === statusFilter.toLowerCase();
            
            return matchesSearch && matchesStatus;
        });

        // Update table with filtered rules
        $('#rulesTableBody').empty();
        currentlyDisplayed = 0;
        
        const endIndex = Math.min(displayedRules, filteredRules.length);
        const rulesToShow = filteredRules.slice(0, endIndex);
        
        rulesToShow.forEach(function(rule) {
            const row = createTableRow(rule);
            $('#rulesTableBody').append(row);
        });

        currentlyDisplayed = endIndex;
        $('#displayedCount').text(currentlyDisplayed);
        $('#totalCount').text(filteredRules.length);
        $('#loadMoreBtn').prop('disabled', currentlyDisplayed >= filteredRules.length);
    }

    // Add the menu bar HTML
    $('.correlation_header').after(`
        <div class="menu-bar">
            <div class="search-container">
                <input type="text" id="ruleSearch" class="form-control" placeholder="Search by Rule Name or Description">
            </div>
            <div class="filter-container">
                <select id="statusFilter" class="form-control">
                    <option value="all">All Status</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
            </div>
        </div>
    `);

    // Add event listeners for search and filter
    $('#ruleSearch').on('input', function() {
        filterRules();
    });

    $('#statusFilter').on('change', function() {
        filterRules();
    });

    // Add CSS for the menu bar
    $('<style>')
        .text(`
            .menu-bar {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 4px;
                align-items: center;
            }
            .search-container {
                flex: 1;
            }
            .filter-container {
                width: 200px;
            }
            #ruleSearch {
                width: 100%;
            }
            #statusFilter {
                width: 100%;
            }
        `)
        .appendTo('head');

    // Add CSS for table alignment
    $('<style>')
        .text(`
            .correlation-rules-table th:nth-last-child(2),
            .correlation-rules-table th:last-child {
                text-align: center;
                width: 120px;
            }
            .correlation-rules-table td:nth-last-child(2),
            .correlation-rules-table td:last-child {
                text-align: center;
                width: 120px;
            }
            .toggle-button {
                min-width: 90px;
            }
            .btn-edit {
                min-width: 80px;
            }
        `)
        .appendTo('head');
}); 