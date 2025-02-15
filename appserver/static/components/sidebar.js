require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/utils'
], function($, mvc, utils) {
    'use strict';

    // Function to initialize sidebar
    function initializeSidebar() {
        // Load sidebar HTML
        $.get('/static/app/cyber_watch/components/sidebar.html', function(html) {
            $('.dashboard-container').prepend(html);
            
            // Initialize sidebar functionality
            setupSidebarHandlers();
            setActiveLink();
            initializeCollapsibleState();

            // Preload logo image for smooth transitions
            preloadImages(['/static/app/cyber_watch/image/cyberwatch_logo.png']);
        });
    }

    // Function to preload images
    function preloadImages(sources) {
        sources.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Function to initialize collapsible state
    function initializeCollapsibleState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            $('#sidebar').addClass('collapsed');
            $('.main-content').addClass('expanded');
        }
    }

    // Function to set up sidebar event handlers
    function setupSidebarHandlers() {
        // Handle sidebar toggle
        $('#sidebarToggle').on('click', function(e) {
            e.preventDefault();
            const $sidebar = $('#sidebar');
            const $mainContent = $('.main-content');
            
            $sidebar.toggleClass('collapsed');
            $mainContent.toggleClass('expanded');
            
            // Save state
            localStorage.setItem('sidebarCollapsed', $sidebar.hasClass('collapsed'));
        });

        // Handle submenu toggle
        $('.has-submenu > .nav-link').on('click', function(e) {
            e.preventDefault();
            const $parent = $(this).parent();
            $parent.toggleClass('open');
            
            // Animate submenu icon
            const $icon = $(this).find('.submenu-icon');
            $icon.css('transform', $parent.hasClass('open') ? 'rotate(180deg)' : 'rotate(0)');
        });

        // Handle submenu hover in collapsed state
        $('.has-submenu').hover(
            function() {
                if ($('#sidebar').hasClass('collapsed')) {
                    $(this).find('.submenu').show();
                }
            },
            function() {
                if ($('#sidebar').hasClass('collapsed')) {
                    $(this).find('.submenu').hide();
                }
            }
        );

        // Handle Create Rule link in sidebar
        $('.create-rule-link').on('click', function(e) {
            e.preventDefault();
            if ($('#createRule').length) {
                $('#createRule').click();
            }
        });
    }

    // Function to set active link based on current page
    function setActiveLink() {
        const currentPath = window.location.pathname;
        $('.nav-link').each(function() {
            const href = $(this).attr('href');
            if (currentPath.includes(href) && href !== '#') {
                $(this).addClass('active');
                $(this).closest('.has-submenu').addClass('open');
            }
        });
    }

    // Initialize on document ready
    $(document).ready(function() {
        // Wait for dashboard to be ready
        setTimeout(function() {
            if ($('#sidebar').length === 0) {
                initializeSidebar();
            }
        }, 100);
    });

    // Export for global use
    window.initializeSidebar = initializeSidebar;
}); 