require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tokenutils',
    'splunkjs/mvc/utils',
    'splunk.util',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc, SearchManager, TokenUtils, utils, SplunkUtil) {
    'use strict';

    // Load Font Awesome
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');

    // Initialize the sidebar
    if (typeof window.initializeSidebar === 'function') {
        window.initializeSidebar();
    }

    // Form handling
    const form = $('#correlationForm');
    const scheduleType = $('#scheduleType');
    const cronSchedule = $('#cronSchedule');
    
    // Initialize form event handlers
    $(document).ready(function() {
        // Schedule type change handler
        $('#scheduleType').on('change', function() {
            const selectedType = $(this).val();
            const cronInput = $('#cronExpression');
            const cronContainer = $('#cronSchedule');
            
            if (selectedType === 'cron') {
                cronContainer.show();
                cronInput.prop('disabled', false);
                cronInput.prop('readonly', false);
                if (!cronInput.val()) {
                    cronInput.val('*/5 * * * *');
                }
                updateCronValidation(cronInput.val());
            } else {
                cronContainer.hide();
                cronInput.prop('disabled', true);
                cronInput.prop('readonly', true);
            }
        });

        // Handle cron expression input
        $('#cronExpression').on('input', function() {
            const cronInput = $(this);
            if (!cronInput.prop('disabled') && !cronInput.prop('readonly')) {
                updateCronValidation(cronInput.val());
            }
        });

        // Initialize schedule type
        $('#scheduleType').trigger('change');
    });

    // Handle form submission
    form.on('submit', function(e) {
        e.preventDefault();
        const saveBtn = $('#saveBtn');
        saveBtn.addClass('is-loading').prop('disabled', true);

        // Get form data
        const formData = {
            name: $('#searchName').val(),
            description: $('#description').val(),
            search: $('#search').val(),
            security_domain: $('#securityDomain').val(),
            severity: $('#severity').val().toLowerCase(),
            schedule_type: $('#scheduleType').val(),
            cron_schedule: $('#scheduleType').val() === 'cron' ? $('#cronExpression').val() : '*/5 * * * *',
            mitreAttack: $('#mitreAttack').val().trim(),
            killChain: $('#killChain').val().trim(),
            cis20: $('#cis20').val().trim(),
            notableTitleField: $('#notableTitleField').val().trim()
        };

        // Map severity to numeric values as required by Splunk
        const severityMap = {
            'low': 1,
            'medium': 3,
            'high': 5,
            'critical': 6
        };

        // Create initial postData object for saved search creation
        const initialPostData = {
            'name': formData.name,
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

        // Debug log
        console.log('Initial save data:', initialPostData);

        // First enable the alert action, then create the saved search
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
            // Now create the saved search
            return $.ajax({
                url: Splunk.util.make_url(`/splunkd/__raw/servicesNS/nobody/${utils.getCurrentApp()}/saved/searches`),
                method: 'POST',
                data: initialPostData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        })
        .then(function(response) {
            console.log('Correlation rule created successfully:', response);
            showMessage('success', 'Correlation rule created successfully');
            setTimeout(() => {
                window.location.href = 'correlation_setup';
            }, 2000);
        })
        .catch(function(xhr, status, error) {
            console.error('Operation failed:', error);
            console.error('Response:', xhr.responseText);
            let errorMsg = error;
            try {
                if (xhr.responseText) {
                    const errorResponse = JSON.parse(xhr.responseText);
                    errorMsg = errorResponse.messages[0].text || error;
                }
            } catch(e) {}
            showMessage('error', 'Failed to create correlation rule: ' + errorMsg);
            saveBtn.removeClass('is-loading').prop('disabled', false);
        });
    });

    // Helper function to show form messages
    function showMessage(type, message) {
        const formActions = $('.form-actions');
        const messageClass = type === 'error' ? 'error-message' : 'success-message';
        
        // Remove any existing messages
        formActions.find('.error-message, .success-message').remove();
        
        // Add the new message
        formActions.prepend(`<div class="${messageClass}">${message}</div>`);
    }

    // Cancel button
    $('#cancelBtn').on('click', function() {
        // Navigate back to correlation setup page
        window.location.href = 'correlation_setup';
    });

    // Cron validation regex
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

    // Predefined cron schedules
    const predefinedSchedules = {
        'custom': '',
        'hourly': '0 * * * *',
        'daily': '0 0 * * *',
        'weekly': '0 0 * * 0',
        'monthly': '0 0 1 * *'
    };

    // Function to validate cron expression
    function validateCronExpression(cron) {
        if (!cron) return false;
        return cronRegex.test(cron.trim());
    }

    // Function to update cron validation message
    function updateCronValidation(cron) {
        const validationMessage = $('#cronValidationMessage');
        if (validateCronExpression(cron)) {
            validationMessage.text('✓ Valid cron expression').css('color', 'green');
            $('#saveBtn').prop('disabled', false);
        } else {
            validationMessage.text('✗ Invalid cron expression').css('color', 'red');
            $('#saveBtn').prop('disabled', true);
        }
    }

    // Add validation message container if not exists
    if ($('#cronValidationMessage').length === 0) {
        $('#cronSchedule').append('<div id="cronValidationMessage" class="help-text"></div>');
    }

    // Search validation and testing functionality
    $('#validateSearch').on('click', function() {
        const searchQuery = $('#search').val().trim();
        const button = $(this);
        
        if (!searchQuery) {
            showMessage('error', 'Please enter a search query first');
            return;
        }

        button.addClass('loading').prop('disabled', true);

        // Create a temporary search manager to validate the search
        try {
            const validationSearch = new SearchManager({
                id: 'validation_search_' + Date.now(),
                preview: true,
                cache: false,
                search: searchQuery,
                earliest_time: '-24h',
                latest_time: 'now',
                app: utils.getCurrentApp(),
                auto_cancel: 90,
                status_buckets: 0,
                required_field_list: '*',
                search_mode: 'normal'
            });

            validationSearch.on('search:error', function(properties) {
                button.removeClass('loading').addClass('error');
                showMessage('error', 'Invalid search: ' + properties.message);
                setTimeout(() => button.removeClass('error').prop('disabled', false), 2000);
            });

            validationSearch.on('search:done', function(properties) {
                if (properties.content.resultCount === 0) {
                    button.removeClass('loading').addClass('warning');
                    showMessage('warning', 'Search is valid but returned no results');
                } else {
                    button.removeClass('loading').addClass('success');
                    showMessage('success', 'Search is valid');
                }
                setTimeout(() => {
                    button.removeClass('success warning').prop('disabled', false);
                }, 2000);
            });

        } catch (error) {
            button.removeClass('loading').addClass('error');
            showMessage('error', 'Invalid search syntax');
            setTimeout(() => button.removeClass('error').prop('disabled', false), 2000);
        }
    });

    $('#testSearch').on('click', function() {
        const searchQuery = $('#search').val().trim();
        const button = $(this);
        
        if (!searchQuery) {
            showMessage('error', 'Please enter a search query first');
            return;
        }

        button.addClass('loading').prop('disabled', true);

        // Create a search manager to test the search
        try {
            const testSearch = new SearchManager({
                id: 'test_search_' + Date.now(),
                preview: true,
                cache: false,
                search: searchQuery,
                earliest_time: '-24h',
                latest_time: 'now',
                app: utils.getCurrentApp(),
                auto_cancel: 90,
                status_buckets: 0,
                required_field_list: '*'
            });

            testSearch.on('search:progress', function(properties) {
                if (properties.content.eventCount > 0) {
                    button.removeClass('loading').addClass('success');
                    showMessage('success', `Found ${properties.content.eventCount} events`);
                    setTimeout(() => {
                        button.removeClass('success').prop('disabled', false);
                    }, 2000);
                }
            });

            testSearch.on('search:error', function(properties) {
                button.removeClass('loading').addClass('error');
                showMessage('error', 'Search error: ' + properties.message);
                setTimeout(() => button.removeClass('error').prop('disabled', false), 2000);
            });

            testSearch.on('search:fail', function(properties) {
                button.removeClass('loading').addClass('error');
                showMessage('error', 'Search failed: ' + properties.message);
                setTimeout(() => button.removeClass('error').prop('disabled', false), 2000);
            });

            testSearch.on('search:done', function(properties) {
                if (!button.hasClass('success')) {
                    if (properties.content.resultCount === 0) {
                        button.removeClass('loading').addClass('warning');
                        showMessage('warning', 'Search completed but found no results');
                    } else {
                        button.removeClass('loading').addClass('success');
                        showMessage('success', `Search completed with ${properties.content.resultCount} results`);
                    }
                    setTimeout(() => {
                        button.removeClass('success warning').prop('disabled', false);
                    }, 2000);
                }
            });

        } catch (error) {
            button.removeClass('loading').addClass('error');
            showMessage('error', 'Failed to execute search: ' + error.message);
            setTimeout(() => button.removeClass('error').prop('disabled', false), 2000);
        }
    });

    // Helper function to show form messages with enhanced styling
    function showMessage(type, message) {
        const formActions = $('.search-container');
        const messageClass = type === 'error' ? 'error-message' : 
                           type === 'warning' ? 'warning-message' : 
                           'success-message';
        
        // Remove any existing messages
        formActions.find('.error-message, .success-message, .warning-message').remove();
        
        // Add the new message with animation
        const messageElement = $(`<div class="search-result-message ${messageClass}">
            <i class="fas ${type === 'error' ? 'fa-times-circle' : 
                          type === 'warning' ? 'fa-exclamation-circle' : 
                          'fa-check-circle'}"></i>
            ${message}
        </div>`);
        
        formActions.append(messageElement);
        
        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageElement.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }
}); 