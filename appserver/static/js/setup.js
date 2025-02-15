require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc) {
    'use strict';

    // Load Font Awesome
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');


    function checkIndexes() {
        var indexes = ['soc_notable', 'soc_summary', 'soc_threat_intel'];
        var completedChecks = 0;
        
        indexes.forEach(function(index) {
            $.ajax({
                url: '/services/data/indexes/' + index,
                method: 'GET',
                success: function() {
                    updateIndexStatus(index, true);
                },
                error: function() {
                    updateIndexStatus(index, false);
                },
                complete: function() {
                    completedChecks++;
                    if (completedChecks === indexes.length) {
                        $('#setup_complete').prop('disabled', false);
                    }
                }
            });
        });
    }
    
    function updateIndexStatus(index, exists) {
        var row = $('tr[data-index="' + index + '"]');
        var status = row.find('.status');
        var button = row.find('.create-index');
        
        if (exists) {
            status.text('Exists').addClass('status-success');
            button.prop('disabled', true);
        } else {
            status.text('Missing').addClass('status-error');
            button.prop('disabled', false);
        }
    }
    
    function createIndex(index) {
        $.ajax({
            url: '/services/data/indexes',
            method: 'POST',
            data: {
                name: index,
                datatype: 'event'
            },
            success: function() {
                updateIndexStatus(index, true);
                showSuccess('Index ' + index + ' created successfully');
            },
            error: function(xhr) {
                showError('Failed to create index ' + index + ': ' + xhr.responseText);
            }
        });
    }
    
    function showSuccess(message) {
        $('#setupStatus')
            .removeClass('alert-error')
            .addClass('alert-success')
            .text(message)
            .show();
    }
    
    function showError(message) {
        $('#setupStatus')
            .removeClass('alert-success')
            .addClass('alert-error')
            .text(message)
            .show();
    }

    // Function to handle section switching
    function showSection(sectionName) {
        // Hide all sections
        $('.setup-content-section').removeClass('active');
        
        // Show selected section
        $(`#${sectionName}-section`).addClass('active');
        
        // Update button states
        $('.menu-button').removeClass('active');
        $(`.menu-button[data-section="${sectionName}"]`).addClass('active');
    }

    // Event listener for menu buttons
    $('.menu-button').on('click', function(e) {
        e.preventDefault();
        const section = $(this).data('section');
        showSection(section);
    });

    // Initialize the page with the first section active
    showSection('general');

    // Add hover effects for index items
    $('.index-item').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );

    // Function to check capabilities
    function checkCapabilities() {
        // This would typically make an API call to check capabilities
        // For now, we'll just add visual feedback
        $('.capability-list li').each(function(index) {
            $(this).delay(index * 100).fadeIn(500);
        });
    }

    // Initialize capability checks
    checkCapabilities();

    // Initialize setup page
    $(document).ready(function() {
        checkIndexes();
        
        // Handle index creation
        $('.create-index').on('click', function() {
            var index = $(this).closest('tr').data('index');
            createIndex(index);
        });
        
        // Handle setup completion
        $('#setup_form').on('submit', function(e) {
            e.preventDefault();
            showSuccess('Setup completed successfully!');
            setTimeout(function() {
                window.location.href = 'correlation_setup';
            }, 2000);
        });
    });
}); 