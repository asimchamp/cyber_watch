require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc, SearchManager) {
    
    // Initialize modal
    var modal = $('#incidentModal');
    var saveButton = $('#saveIncident');
    var closeButton = $('#closeIncident');
    var currentIncidentId = null;
    
    // Handle incident row click
    $('#incidentTable').on('click', 'tr', function() {
        var data = $(this).data();
        if (data) {
            currentIncidentId = data._raw;
            $('#incidentStatus').val(data.status || 'new');
            $('#incidentOwner').val(data.owner || '');
            $('#mitreTactic').val(data.mitre_tactic || '');
            $('#actionTaken').val(data.action_taken || '');
            $('#incidentNotes').val(data.notes || '');
            modal.show();
        }
    });
    
    // Handle save button click
    saveButton.on('click', function() {
        if (!currentIncidentId) return;
        
        var updates = {
            status: $('#incidentStatus').val(),
            owner: $('#incidentOwner').val(),
            mitre_tactic: $('#mitreTactic').val(),
            action_taken: $('#actionTaken').val(),
            notes: $('#incidentNotes').val(),
            last_updated: new Date().toISOString(),
            last_updated_by: Splunk.util.getConfigValue('USERNAME')
        };
        
        // Update incident in KV store
        updateNotableEvent(currentIncidentId, updates);
        modal.hide();
    });
    
    // Handle close button click
    closeButton.on('click', function() {
        modal.hide();
    });
    
    function updateNotableEvent(id, data) {
        // Create search to update notable event
        var searchQuery = '| search index=notable id=' + id + ' | eval status="' + data.status + 
                         '", owner="' + data.owner + '", notes="' + data.notes + 
                         '", last_updated=now(), last_updated_by="' + data.user + 
                         '" | collect index=notable';
        
        var updateManager = new SearchManager({
            id: 'updateNotable_' + Date.now(),
            search: searchQuery,
            earliest_time: '-5m',
            latest_time: 'now'
        });
        
        updateManager.on('search:done', function(properties) {
            if (properties.content.resultCount > 0) {
                showSuccess('Notable event updated successfully');
            } else {
                showError('Failed to update notable event');
            }
        });
    }
    
    function logIncidentHistory(data) {
        // Create search to log incident history
        var searchQuery = '| makeresults | eval incident_id="' + data.incident_id + 
                         '", timestamp=now(), user="' + data.user + 
                         '", changes="' + data.changes + 
                         '" | collect index=soc_summary sourcetype=incident_history';
        
        var historyManager = new SearchManager({
            id: 'logHistory_' + Date.now(),
            search: searchQuery,
            earliest_time: '-5m',
            latest_time: 'now'
        });
        
        historyManager.on('search:done', function(properties) {
            if (properties.content.resultCount === 0) {
                console.error('Failed to log incident history');
            }
        });
    }
    
    function showSuccess(message) {
        // Implementation of success message display
        console.log('Success:', message);
    }
    
    function showError(message) {
        // Implementation of error message display
        console.error('Error:', message);
    }
    
    // Add keyboard shortcuts
    $(document).keydown(function(e) {
        if (modal.is(':visible')) {
            if (e.key === 'Escape') {
                modal.hide();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveButton.click();
            }
        }
    });
}); 