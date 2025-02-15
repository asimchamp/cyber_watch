require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, SearchManager, Chart) {
    'use strict';
    
    // Load Font Awesome
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">');
    
    // Make Chart available globally
    window.Chart = Chart;
    
    // Update Water Usage box title to Critical Notable
    $('.water-box .metric-title-row h3').text('Critical Notable');
    
    // Add loading animation HTML to each metric box
    $('.metric-box').each(function() {
        const $loadingDiv = $('<div class="loading-animation" style="display: none;"><div class="three-body"><div class="three-body__dot"></div><div class="three-body__dot"></div><div class="three-body__dot"></div></div></div>');
        $(this).find('.metric-content').append($loadingDiv);
    });
    
    // Function to show/hide loading animation
    function toggleLoading(boxClass, show) {
        const $box = $(`.${boxClass}`);
        const $loading = $box.find('.loading-animation');
        const $content = $box.find('.metric-value, .trend');
        
        if (show) {
            $content.css('opacity', '0.3');
            $loading.show();
        } else {
            $content.css('opacity', '1');
            $loading.hide();
        }
    }
    
    // Track current period
    let currentPeriod = '24h';
    
    // Declare searchManagers variable (not constant)
    let searchManagers = {};
    
    // Function to handle percentage results for Critical Notable
    function handleCriticalPercentageResults(manager) {
        toggleLoading('water-box', true);  // Show loading
        
        const results = manager.data('results');
        results.on('data', function() {
            const data = results.data();
            console.log('Critical Notable Percentage data:', data);
            
            if (data && data.rows && data.rows.length > 0) {
                const percentage = parseFloat(data.rows[0][0]) || 0;
                console.log('Calculated Critical Notable percentage:', percentage);
                
                const $trendValue = $('.water-box .trend-value');
                const $trendContainer = $('.water-box .trend');
                const $trendIcon = $trendContainer.find('i');
                
                // Update percentage value
                $trendValue.text(Math.abs(percentage).toFixed(2));
                
                // Update trend direction and class
                $trendContainer.removeClass('positive negative')
                    .addClass(percentage >= 0 ? 'positive' : 'negative');
                
                $trendIcon.removeClass('fa-arrow-up fa-arrow-down')
                    .addClass(percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            } else {
                console.error('No Critical Notable percentage data in results');
                $('.water-box .trend-value').text('0.00');
            }
            
            toggleLoading('water-box', false);  // Hide loading after data is shown
        });
        
        results.on('error', function(err) {
            console.error('Critical Notable Percentage results error:', err);
            $('.water-box .trend-value').text('Error');
            toggleLoading('water-box', false);  // Hide loading on error
        });
    }
    
    // Function to handle percentage results
    function handlePercentageResults(manager) {
        toggleLoading('users-box', true);  // Show loading
        
        const results = manager.data('results');
        results.on('data', function() {
            const data = results.data();
            console.log('Percentage data:', data);
            
            if (data && data.rows && data.rows.length > 0) {
                const percentage = parseFloat(data.rows[0][0]) || 0;
                console.log('Calculated percentage:', percentage);
                
                const $trendValue = $('.users-box .trend-value');
                const $trendContainer = $('.users-box .trend');
                const $trendIcon = $trendContainer.find('i');
                
                // Update percentage value
                $trendValue.text(Math.abs(percentage).toFixed(2));
                
                // Update trend direction and class
                $trendContainer.removeClass('positive negative')
                    .addClass(percentage >= 0 ? 'positive' : 'negative');
                
                $trendIcon.removeClass('fa-arrow-up fa-arrow-down')
                    .addClass(percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            } else {
                console.error('No percentage data in results');
                $('.users-box .trend-value').text('0.00');
            }
            
            toggleLoading('users-box', false);  // Hide loading after data is shown
        });
        
        results.on('error', function(err) {
            console.error('Percentage results error:', err);
            $('.users-box .trend-value').text('Error');
            toggleLoading('users-box', false);  // Hide loading on error
        });
    }
    
    // Function to handle percentage results for Electricity
    function handleElectricityPercentageResults(manager) {
        toggleLoading('electricity-box', true);  // Show loading
        
        const results = manager.data('results');
        results.on('data', function() {
            const data = results.data();
            console.log('Electricity Percentage data:', data);
            
            if (data && data.rows && data.rows.length > 0) {
                const percentage = parseFloat(data.rows[0][0]) || 0;
                console.log('Calculated Electricity percentage:', percentage);
                
                const $trendValue = $('.electricity-box .trend-value');
                const $trendContainer = $('.electricity-box .trend');
                const $trendIcon = $trendContainer.find('i');
                
                // Update percentage value
                $trendValue.text(Math.abs(percentage).toFixed(2));
                
                // Update trend direction and class
                $trendContainer.removeClass('positive negative')
                    .addClass(percentage >= 0 ? 'positive' : 'negative');
                
                $trendIcon.removeClass('fa-arrow-up fa-arrow-down')
                    .addClass(percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            } else {
                console.error('No Electricity percentage data in results');
                $('.electricity-box .trend-value').text('0.00');
            }
            
            toggleLoading('electricity-box', false);  // Hide loading after data is shown
        });
        
        results.on('error', function(err) {
            console.error('Electricity Percentage results error:', err);
            $('.electricity-box .trend-value').text('Error');
            toggleLoading('electricity-box', false);  // Hide loading on error
        });
    }

    // Function to handle percentage results for Gas
    function handleGasPercentageResults(manager) {
        toggleLoading('gas-box', true);  // Show loading
        
        const results = manager.data('results');
        results.on('data', function() {
            const data = results.data();
            console.log('Gas Percentage data:', data);
            
            if (data && data.rows && data.rows.length > 0) {
                const percentage = parseFloat(data.rows[0][0]) || 0;
                console.log('Calculated Gas percentage:', percentage);
                
                const $trendValue = $('.gas-box .trend-value');
                const $trendContainer = $('.gas-box .trend');
                const $trendIcon = $trendContainer.find('i');
                
                // Update percentage value
                $trendValue.text(Math.abs(percentage).toFixed(2));
                
                // Update trend direction and class
                $trendContainer.removeClass('positive negative')
                    .addClass(percentage >= 0 ? 'positive' : 'negative');
                
                $trendIcon.removeClass('fa-arrow-up fa-arrow-down')
                    .addClass(percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            } else {
                console.error('No Gas percentage data in results');
                $('.gas-box .trend-value').text('0.00');
            }
            
            toggleLoading('gas-box', false);  // Hide loading after data is shown
        });
        
        results.on('error', function(err) {
            console.error('Gas Percentage results error:', err);
            $('.gas-box .trend-value').text('Error');
            toggleLoading('gas-box', false);  // Hide loading on error
        });
    }
    
    // Create or update search managers for different time periods
    const getOrCreateSearchManagers = (period) => {
        // Get existing search managers if they exist
        let countManager = mvc.Components.get(`notable_count_${period}`);
        let trendManager = mvc.Components.get(`notable_trend_${period}`);
        let percentageManager = mvc.Components.get(`notable_percentage_${period}`);
        
        // Get existing Critical Notable search managers if they exist
        let criticalCountManager = mvc.Components.get(`critical_count_${period}`);
        let criticalTrendManager = mvc.Components.get(`critical_trend_${period}`);
        let criticalPercentageManager = mvc.Components.get(`critical_percentage_${period}`);

        // Get existing Electricity search managers if they exist
        let electricityCountManager = mvc.Components.get(`electricity_count_${period}`);
        let electricityTrendManager = mvc.Components.get(`electricity_trend_${period}`);
        let electricityPercentageManager = mvc.Components.get(`electricity_percentage_${period}`);

        // Get existing Gas search managers if they exist
        let gasCountManager = mvc.Components.get(`gas_count_${period}`);
        let gasTrendManager = mvc.Components.get(`gas_trend_${period}`);
        let gasPercentageManager = mvc.Components.get(`gas_percentage_${period}`);
        
        // If they exist, cancel their searches
        if (countManager) countManager.cancel();
        if (trendManager) trendManager.cancel();
        if (percentageManager) percentageManager.cancel();
        if (criticalCountManager) criticalCountManager.cancel();
        if (criticalTrendManager) criticalTrendManager.cancel();
        if (criticalPercentageManager) criticalPercentageManager.cancel();
        if (electricityCountManager) electricityCountManager.cancel();
        if (electricityTrendManager) electricityTrendManager.cancel();
        if (electricityPercentageManager) electricityPercentageManager.cancel();
        if (gasCountManager) gasCountManager.cancel();
        if (gasTrendManager) gasTrendManager.cancel();
        if (gasPercentageManager) gasPercentageManager.cancel();
        
        const timeRange = {
            '24h': '-24h',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        const previousTimeRange = {
            '24h': '-1d',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        const currentTimeRange = {
            '24h': 'now',
            '7D': 'now',
            '30D': 'now'
        }[period];

        const previousTimeRange_b = {
            '24h': '-2d',
            '7D': '-14d',
            '30D': '-60d'
        }[period];

        const currentTimeRange_b = {
            '24h': '-1d',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        const span = {
            '24h': '1h',
            '7D': '6h',
            '30D': '1d'
        }[period];
        
        // Create new search managers if they don't exist
        if (!countManager) {
            countManager = new SearchManager({
            id: `notable_count_${period}`,
            search: `index=soc_notable | stats count`,
            earliest_time: timeRange,
            latest_time: 'now',
            autostart: false,
            preview: true,
            cache: false,
            status_buckets: 300,
            required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
        });
        }
        
        if (!trendManager) {
            trendManager = new SearchManager({
            id: `notable_trend_${period}`,
            search: `index=soc_notable | timechart span=${span} count`,
            earliest_time: timeRange,
            latest_time: 'now',
            autostart: false,
            preview: true,
            cache: false,
            status_buckets: 300,
            required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }

        if (!percentageManager) {
            percentageManager = new SearchManager({
                id: `notable_percentage_${period}`,
                search: `index=soc_notable earliest=${previousTimeRange} latest=${currentTimeRange} | stats count as current_count by index
                        | append [search index=soc_notable earliest=${previousTimeRange_b} latest=${currentTimeRange_b} | stats count as previous_count by index]
                        | stats values(current_count) as current_count values(previous_count) as previous_count by index
                        | eval percentage_increase=if(previous_count=0, 100, round(((current_count - previous_count) / previous_count) * 100, 2))
                        | fields percentage_increase`,
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
            
            // Set up event handlers for percentage manager
            percentageManager.on('search:done', function(properties) {
                console.log('Percentage search completed:', properties);
                handlePercentageResults(percentageManager);
            });

            percentageManager.on('search:error', function(properties) {
                console.error('Percentage search error:', properties);
                $('.users-box .trend-value').text('Error');
                if (properties.error && properties.error.messages) {
                    properties.error.messages.forEach(msg => console.error('Percentage search error:', msg));
                }
            });

            percentageManager.on('search:failed', function(properties) {
                console.error('Percentage search failed:', properties);
                $('.users-box .trend-value').text('Failed');
                if (properties.content && properties.content.messages) {
                    properties.content.messages.forEach(msg => console.error('Percentage search failure:', msg));
                }
            });
        }
        
        // Create new Critical Notable search managers if they don't exist
        if (!criticalCountManager) {
            criticalCountManager = new SearchManager({
                id: `critical_count_${period}`,
                search: `index=soc_notable severity=critical | stats count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }
        
        if (!criticalTrendManager) {
            criticalTrendManager = new SearchManager({
                id: `critical_trend_${period}`,
                search: `index=soc_notable severity=critical | timechart span=${span} count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }

        if (!criticalPercentageManager) {
            criticalPercentageManager = new SearchManager({
                id: `critical_percentage_${period}`,
                search: `index=soc_notable severity=critical earliest=${previousTimeRange} latest=${currentTimeRange} | stats count as current_count by index
                        | append [search index=soc_notable earliest=${previousTimeRange_b} latest=${currentTimeRange_b} | stats count as previous_count by index]
                        | stats values(current_count) as current_count values(previous_count) as previous_count by index
                        | eval percentage_increase=if(previous_count=0, 100, round(((current_count - previous_count) / previous_count) * 100, 2))
                        | fields percentage_increase`,  // You'll update this SPL
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
            
            // Set up event handlers for Critical Notable percentage manager
            criticalPercentageManager.on('search:done', function(properties) {
                console.log('Critical Notable Percentage search completed:', properties);
                handleCriticalPercentageResults(criticalPercentageManager);
            });

            criticalPercentageManager.on('search:error', function(properties) {
                console.error('Critical Notable Percentage search error:', properties);
                $('.water-box .trend-value').text('Error');
                if (properties.error && properties.error.messages) {
                    properties.error.messages.forEach(msg => console.error('Critical Notable Percentage search error:', msg));
                }
            });

            criticalPercentageManager.on('search:failed', function(properties) {
                console.error('Critical Notable Percentage search failed:', properties);
                $('.water-box .trend-value').text('Failed');
                if (properties.content && properties.content.messages) {
                    properties.content.messages.forEach(msg => console.error('Critical Notable Percentage search failure:', msg));
                }
            });
        }

        // Create new Electricity search managers if they don't exist
        if (!electricityCountManager) {
            electricityCountManager = new SearchManager({
                id: `electricity_count_${period}`,
                search: `index=soc_notable severity=high | stats count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }
        
        if (!electricityTrendManager) {
            electricityTrendManager = new SearchManager({
                id: `electricity_trend_${period}`,
                search: `index=soc_notable severity=high | timechart span=${span} count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }

        if (!electricityPercentageManager) {
            electricityPercentageManager = new SearchManager({
                id: `electricity_percentage_${period}`,
                search: `index=soc_notable severity=high earliest=${previousTimeRange} latest=${currentTimeRange} | stats count as current_count by index
                        | append [search index=soc_notable earliest=${previousTimeRange_b} latest=${currentTimeRange_b} | stats count as previous_count by index]
                        | stats values(current_count) as current_count values(previous_count) as previous_count by index
                        | eval percentage_increase=if(previous_count=0, 100, round(((current_count - previous_count) / previous_count) * 100, 2))
                        | fields percentage_increase`,  // You'll update this SPL
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
            
            // Set up event handlers for Electricity percentage manager
            electricityPercentageManager.on('search:done', function(properties) {
                console.log('Electricity Percentage search completed:', properties);
                handleElectricityPercentageResults(electricityPercentageManager);
            });

            electricityPercentageManager.on('search:error', function(properties) {
                console.error('Electricity Percentage search error:', properties);
                $('.electricity-box .trend-value').text('Error');
                if (properties.error && properties.error.messages) {
                    properties.error.messages.forEach(msg => console.error('Electricity Percentage search error:', msg));
                }
            });

            electricityPercentageManager.on('search:failed', function(properties) {
                console.error('Electricity Percentage search failed:', properties);
                $('.electricity-box .trend-value').text('Failed');
                if (properties.content && properties.content.messages) {
                    properties.content.messages.forEach(msg => console.error('Electricity Percentage search failure:', msg));
                }
            });
        }

        // Create new Gas search managers if they don't exist
        if (!gasCountManager) {
            gasCountManager = new SearchManager({
                id: `gas_count_${period}`,
                search: `index=soc_notable | stats dc(search_name) as count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }
        
        if (!gasTrendManager) {
            gasTrendManager = new SearchManager({
                id: `gas_trend_${period}`,
                search: `index=soc_notable | timechart span=${span} dc(search_name) as count`,  // You'll update this SPL
                earliest_time: timeRange,
                latest_time: 'now',
                autostart: false,
                preview: true,
                cache: false,
                status_buckets: 300,
                required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
        }

        if (!gasPercentageManager) {
            gasPercentageManager = new SearchManager({
                id: `gas_percentage_${period}`,
                search: `index=soc_notable earliest=${previousTimeRange} latest=${currentTimeRange} | stats dc(search_name) as current_count by index
                        | append [search index=soc_notable earliest=${previousTimeRange_b} latest=${currentTimeRange_b} | stats dc(search_name) as previous_count by index]
                    | stats values(current_count) as current_count values(previous_count) as previous_count by index
                        | eval percentage_increase=if(previous_count=0, 100, round(((current_count - previous_count) / previous_count) * 100, 2))
                        | fields percentage_increase`,  // You'll update this SPL
            autostart: false,
            preview: true,
            cache: false,
            status_buckets: 300,
            required_field_list: "*",
                app: "cyber_watch",
                refresh: 0
            });
            
            // Set up event handlers for Gas percentage manager
            gasPercentageManager.on('search:done', function(properties) {
                console.log('Gas Percentage search completed:', properties);
                handleGasPercentageResults(gasPercentageManager);
            });

            gasPercentageManager.on('search:error', function(properties) {
                console.error('Gas Percentage search error:', properties);
                $('.gas-box .trend-value').text('Error');
                if (properties.error && properties.error.messages) {
                    properties.error.messages.forEach(msg => console.error('Gas Percentage search error:', msg));
                }
            });

            gasPercentageManager.on('search:failed', function(properties) {
                console.error('Gas Percentage search failed:', properties);
                $('.gas-box .trend-value').text('Failed');
                if (properties.content && properties.content.messages) {
                    properties.content.messages.forEach(msg => console.error('Gas Percentage search failure:', msg));
                }
            });
        }
        
        return { 
            countManager, 
            trendManager, 
            percentageManager,
            criticalCountManager,
            criticalTrendManager,
            criticalPercentageManager,
            electricityCountManager,
            electricityTrendManager,
            electricityPercentageManager,
            gasCountManager,
            gasTrendManager,
            gasPercentageManager
        };
    };
    
    // Function to format numbers with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Function to animate number changes
    function animateNumber($element, start, end, duration = 1000) {
        const range = end - start;
        const minTimer = 50;
        const stepTime = Math.abs(Math.floor(duration / range));
        const startTime = new Date().getTime();
        const endTime = startTime + duration;
        let timer;
        
        function run() {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / duration, 0);
            const value = Math.round(end - (remaining * range));
            $element.text(formatNumber(value));
            if (value === end) {
                clearInterval(timer);
            }
        }
        
        timer = setInterval(run, Math.min(stepTime, minTimer));
        run();
    }
    
    // Function to calculate trend percentage
    function calculateTrend(currentValue, previousValue) {
        if (!previousValue) return { value: 0, direction: 'up' };
        const change = ((currentValue - previousValue) / previousValue) * 100;
        return {
            value: Math.abs(Math.round(change)),
            direction: change >= 0 ? 'up' : 'down'
        };
    }
    
    // Function to update progress circle
    function updateProgressCircle(selector, percentage) {
        const circle = document.querySelector(`${selector} .circle-progress`);
        const value = document.querySelector(`${selector} .circle-value`);
        
        // Ensure percentage is between 0 and 100
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        
        // Calculate degrees for the conic gradient (0 to 360)
        const degrees = (clampedPercentage / 100) * 360;
        
        // Get the color based on the selector
        let color;
        if (selector.includes('critical')) {
            color = getComputedStyle(document.documentElement).getPropertyValue('--critical-color').trim();
        } else if (selector.includes('high')) {
            color = getComputedStyle(document.documentElement).getPropertyValue('--high-color').trim();
        } else if (selector.includes('rules')) {
            color = getComputedStyle(document.documentElement).getPropertyValue('--rules-color').trim();
        }
        
        // Update the conic gradient
        circle.style.background = `conic-gradient(${color} ${degrees}deg, #eee ${degrees}deg)`;
        
        // Update percentage text
        value.textContent = `${Math.round(clampedPercentage)}%`;
    }

    // Function to update notable counts and percentages
    function updateNotableStats(countManager, totalCount) {
        toggleStatsLoading(true);
        
        const results = countManager.data('results');
        results.on('data', function() {
            const data = results.data();
            if (data && data.rows && data.rows.length > 0) {
                const count = parseInt(data.rows[0][0]);
                const percentage = (count / totalCount) * 100;
                
                // Update based on manager type
                if (countManager.id.includes('critical')) {
                    document.querySelector('.critical-count').textContent = `${count} Notables`;
                    updateProgressCircle('.progress.critical', percentage);
                } else if (countManager.id.includes('electricity')) {
                    document.querySelector('.high-count').textContent = `${count} Notables`;
                    updateProgressCircle('.progress.high', percentage);
                } else if (countManager.id.includes('gas')) {
                    document.querySelector('.rules-count').textContent = `${count} Rules`;
                    updateProgressCircle('.progress.rules', percentage);
                }
            }
            toggleStatsLoading(false);
        });
        
        results.on('error', function(err) {
            console.error('Notable Stats results error:', err);
            toggleStatsLoading(false);
        });
    }

    // Function to show/hide loading animation for Usage Overview
    function toggleChartLoading(show) {
        const $container = $('.chart-container');
        const $loading = $container.find('.loading-animation');
        
        if (show) {
            $container.addClass('loading');
            $loading.show();
        } else {
            $container.removeClass('loading');
            $loading.hide();
        }
    }

    // Function to show/hide loading animation for Notable Stats
    function toggleStatsLoading(show) {
        const $container = $('.circular-progress');
        const $loading = $container.find('.loading-animation');
        
        if (show) {
            $container.addClass('loading');
            $loading.show();
        } else {
            $container.removeClass('loading');
            $loading.hide();
        }
    }

    // Function to update metrics display with Splunk data
    function updateMetrics(period) {
        currentPeriod = period;
        
        // Show loading for all metric boxes
        toggleLoading('users-box', true);
        toggleLoading('water-box', true);
        toggleLoading('electricity-box', true);
        toggleLoading('gas-box', true);
        
        // Get or create search managers and update the existing object
        const newSearchManagers = getOrCreateSearchManagers(period);
        Object.assign(searchManagers, newSearchManagers);
        
        // Start all searches
        searchManagers.countManager.startSearch();
        searchManagers.trendManager.startSearch();
        searchManagers.percentageManager.startSearch();
        searchManagers.criticalCountManager.startSearch();
        searchManagers.criticalTrendManager.startSearch();
        searchManagers.criticalPercentageManager.startSearch();
        searchManagers.electricityCountManager.startSearch();
        searchManagers.electricityTrendManager.startSearch();
        searchManagers.electricityPercentageManager.startSearch();
        searchManagers.gasCountManager.startSearch();
        searchManagers.gasTrendManager.startSearch();
        searchManagers.gasPercentageManager.startSearch();
        
        // Update the main chart with the new period
        updateMainChart(period);
        
        // Handle count results
        searchManagers.countManager.on('search:done', function(properties) {
            console.log('Count search completed:', properties);
            
            const results = searchManagers.countManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const totalCount = parseInt(data.rows[0][0]);
                    console.log('Retrieved total count:', totalCount);
                    
                    // Update Notable Triggers count
                    const $notableCount = $('#notableCount');
                    const currentValue = parseInt($notableCount.text().replace(/,/g, '')) || 0;
                    animateNumber($notableCount, currentValue, totalCount);
                    
                    // Update stats for each category using the total count
                    updateNotableStats(searchManagers.criticalCountManager, totalCount);
                    updateNotableStats(searchManagers.electricityCountManager, totalCount);
                    updateNotableStats(searchManagers.gasCountManager, totalCount);
                } else {
                    console.error('No count data in results');
                    $('#notableCount').text('0');
                }
                toggleLoading('users-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Count results error:', err);
                $('#notableCount').text('Error');
                toggleLoading('users-box', false);
            });
        });

        // Handle trend results for chart only
        searchManagers.trendManager.on('search:done', function(properties) {
            console.log('Trend search completed:', properties);
            
            const results = searchManagers.trendManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows) {
                    const trendData = data.rows.map(row => parseInt(row[1]) || 0);
                    console.log('Extracted trend data:', trendData);
                    
                    // Update trendline chart only
                        const $trendline = $('.users-box .trendline-chart');
                        if ($trendline.length) {
                            const $metricIcon = $('.users-box .metric-icon');
                            const color = $metricIcon.length ? getComputedStyle($metricIcon[0]).color : '#000000';
                            updateTrendline($trendline, trendData, color);
                        }
                    }
            });
        });

        // Handle Critical Notable count results
        searchManagers.criticalCountManager.on('search:done', function(properties) {
            console.log('Critical Notable Count search completed:', properties);
            
            const results = searchManagers.criticalCountManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const count = parseInt(data.rows[0][0]);
                    console.log('Retrieved Critical Notable count:', count);
                    
                    const $number = $('.water-box .number');
                    const currentValue = parseInt($number.text().replace(/,/g, '')) || 0;
                    animateNumber($number, currentValue, count);
                } else {
                    console.error('No Critical Notable count data in results');
                    $('.water-box .number').text('0');
                }
                toggleLoading('water-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Critical Notable Count results error:', err);
                $('.water-box .number').text('Error');
                toggleLoading('water-box', false);
            });
        });

        // Handle Critical Notable trend results
        searchManagers.criticalTrendManager.on('search:done', function(properties) {
            console.log('Critical Notable Trend search completed:', properties);
            
            const results = searchManagers.criticalTrendManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows) {
                    const trendData = data.rows.map(row => parseInt(row[1]) || 0);
                    console.log('Extracted Critical Notable trend data:', trendData);
                    
                    // Update trendline chart
                    const $trendline = $('.water-box .trendline-chart');
                    if ($trendline.length) {
                        const $metricIcon = $('.water-box .metric-icon');
                        const color = $metricIcon.length ? getComputedStyle($metricIcon[0]).color : '#000000';
                        updateTrendline($trendline, trendData, color);
                    }
                }
            });
        });

        // Handle High Events count results
        searchManagers.electricityCountManager.on('search:done', function(properties) {
            console.log('High Events Count search completed:', properties);
            
            const results = searchManagers.electricityCountManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const count = parseInt(data.rows[0][0]);
                    console.log('Retrieved High Events count:', count);
                    
                    const $number = $('.electricity-box .number');
                    const currentValue = parseInt($number.text().replace(/,/g, '')) || 0;
                    animateNumber($number, currentValue, count);
                } else {
                    console.error('No High Events count data in results');
                    $('.electricity-box .number').text('0');
                }
                toggleLoading('electricity-box', false);
            });
            
            results.on('error', function(err) {
                console.error('High Events Count results error:', err);
                $('.electricity-box .number').text('Error');
                toggleLoading('electricity-box', false);
            });
        });

        // Handle High Events trend results
        searchManagers.electricityTrendManager.on('search:done', function(properties) {
            console.log('High Events Trend search completed:', properties);
            
            const results = searchManagers.electricityTrendManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows) {
                    const trendData = data.rows.map(row => parseInt(row[1]) || 0);
                    console.log('Extracted High Events trend data:', trendData);
                    
                    // Update trendline chart
                    const $trendline = $('.electricity-box .trendline-chart');
                    if ($trendline.length) {
                        const $metricIcon = $('.electricity-box .metric-icon');
                        const color = $metricIcon.length ? getComputedStyle($metricIcon[0]).color : '#000000';
                        updateTrendline($trendline, trendData, color);
                    }
                }
            });
        });

        // Handle Correlation Rules count results
        searchManagers.gasCountManager.on('search:done', function(properties) {
            console.log('Correlation Rules Count search completed:', properties);
            
            const results = searchManagers.gasCountManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const count = parseInt(data.rows[0][0]);
                    console.log('Retrieved Correlation Rules count:', count);
                    
                    const $number = $('.gas-box .number');
                    const currentValue = parseInt($number.text().replace(/,/g, '')) || 0;
                    animateNumber($number, currentValue, count);
                } else {
                    console.error('No Correlation Rules count data in results');
                    $('.gas-box .number').text('0');
                }
                toggleLoading('gas-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Correlation Rules Count results error:', err);
                $('.gas-box .number').text('Error');
                toggleLoading('gas-box', false);
            });
        });

        // Handle Correlation Rules trend results
        searchManagers.gasTrendManager.on('search:done', function(properties) {
            console.log('Correlation Rules Trend search completed:', properties);
            
            const results = searchManagers.gasTrendManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows) {
                    const trendData = data.rows.map(row => parseInt(row[1]) || 0);
                    console.log('Extracted Correlation Rules trend data:', trendData);
                    
                    // Update trendline chart
                    const $trendline = $('.gas-box .trendline-chart');
                    if ($trendline.length) {
                        const $metricIcon = $('.gas-box .metric-icon');
                        const color = $metricIcon.length ? getComputedStyle($metricIcon[0]).color : '#000000';
                        updateTrendline($trendline, trendData, color);
                    }
                }
            });
        });

        // Handle percentage results
        searchManagers.percentageManager.on('search:done', function(properties) {
            console.log('Notable Percentage search completed:', properties);
            
            const results = searchManagers.percentageManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const percentage = parseFloat(data.rows[0][0]) || 0;
                    console.log('Calculated percentage:', percentage);
                    
                    const $trendValue = $('.users-box .trend');
                    const $trendIcon = $trendValue.find('i');
                    
                    // Update percentage value and icon
                    $trendValue.html(`
                        <i class="fas ${percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${Math.abs(percentage).toFixed(2)}%
                    `);
                    
                    // Update trend direction and class (reversed logic)
                    $trendValue.removeClass('positive negative')
                        .addClass(percentage >= 0 ? 'negative' : 'positive');
                } else {
                    console.error('No percentage data in results');
                    $('.users-box .trend').html('<i class="fas fa-arrow-right"></i> 0.00%');
                }
                toggleLoading('users-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Percentage results error:', err);
                $('.users-box .trend').html('<i class="fas fa-arrow-right"></i> Error');
                toggleLoading('users-box', false);
            });
        });

        // Handle Critical Notable percentage results
        searchManagers.criticalPercentageManager.on('search:done', function(properties) {
            console.log('Critical Notable Percentage search completed:', properties);
            
            const results = searchManagers.criticalPercentageManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const percentage = parseFloat(data.rows[0][0]) || 0;
                    console.log('Calculated Critical Notable percentage:', percentage);
                    
                    const $trendValue = $('.water-box .trend');
                    
                    // Update percentage value and icon
                    $trendValue.html(`
                        <i class="fas ${percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${Math.abs(percentage).toFixed(2)}%
                    `);
                    
                    // Update trend direction and class (reversed logic)
                    $trendValue.removeClass('positive negative')
                        .addClass(percentage >= 0 ? 'negative' : 'positive');
                } else {
                    console.error('No Critical Notable percentage data in results');
                    $('.water-box .trend').html('<i class="fas fa-arrow-right"></i> 0.00%');
                }
                toggleLoading('water-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Critical Notable Percentage results error:', err);
                $('.water-box .trend').html('<i class="fas fa-arrow-right"></i> Error');
                toggleLoading('water-box', false);
            });
        });

        // Handle High Events percentage results
        searchManagers.electricityPercentageManager.on('search:done', function(properties) {
            console.log('High Events Percentage search completed:', properties);
            
            const results = searchManagers.electricityPercentageManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const percentage = parseFloat(data.rows[0][0]) || 0;
                    console.log('Calculated High Events percentage:', percentage);
                    
                    const $trendValue = $('.electricity-box .trend');
                    
                    // Update percentage value and icon
                    $trendValue.html(`
                        <i class="fas ${percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${Math.abs(percentage).toFixed(2)}%
                    `);
                    
                    // Update trend direction and class (reversed logic)
                    $trendValue.removeClass('positive negative')
                        .addClass(percentage >= 0 ? 'negative' : 'positive');
                } else {
                    console.error('No High Events percentage data in results');
                    $('.electricity-box .trend').html('<i class="fas fa-arrow-right"></i> 0.00%');
                }
                toggleLoading('electricity-box', false);
            });
            
            results.on('error', function(err) {
                console.error('High Events Percentage results error:', err);
                $('.electricity-box .trend').html('<i class="fas fa-arrow-right"></i> Error');
                toggleLoading('electricity-box', false);
            });
        });

        // Handle Correlation Rules percentage results
        searchManagers.gasPercentageManager.on('search:done', function(properties) {
            console.log('Correlation Rules Percentage search completed:', properties);
            
            const results = searchManagers.gasPercentageManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const percentage = parseFloat(data.rows[0][0]) || 0;
                    console.log('Calculated Correlation Rules percentage:', percentage);
                    
                    const $trendValue = $('.gas-box .trend');
                    
                    // Update percentage value and icon
                    $trendValue.html(`
                        <i class="fas ${percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${Math.abs(percentage).toFixed(2)}%
                    `);
                    
                    // Update trend direction and class (reversed logic)
                    $trendValue.removeClass('positive negative')
                        .addClass(percentage >= 0 ? 'negative' : 'positive');
                } else {
                    console.error('No Correlation Rules percentage data in results');
                    $('.gas-box .trend').html('<i class="fas fa-arrow-right"></i> 0.00%');
                }
                toggleLoading('gas-box', false);
            });
            
            results.on('error', function(err) {
                console.error('Correlation Rules Percentage results error:', err);
                $('.gas-box .trend').html('<i class="fas fa-arrow-right"></i> Error');
                toggleLoading('gas-box', false);
            });
        });
    }
    
    // Function to update trend indicators
    function updateTrend(selector, value, direction) {
        const $trend = $(selector);
        if (!$trend.length) return;
        
        // Create trend HTML
        const trendHTML = `
            <i class="fas fa-arrow-${direction === 'up' ? 'up' : 'down'}"></i>
            ${Math.abs(value)}%
        `;
        
        // Update class and content with animation
        $trend.fadeOut(200, function() {
            $trend.removeClass('positive negative')
                  .addClass(direction === 'up' ? 'positive' : 'negative')
                  .html(trendHTML)
                  .fadeIn(200);
        });
    }
    
    // Function to update trendline visualization
    function updateTrendline($container, data, color) {
        if (!$container.length) return;
        
        // Clear previous content
        $container.empty();
        
        // Calculate dimensions
        const width = $container.width() || 200;
        const height = 80;
        const points = data.length;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Create gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `gradient-${Math.random().toString(36).substr(2, 9)}`);
        gradient.setAttribute('x1', '0');
        gradient.setAttribute('y1', '0');
        gradient.setAttribute('x2', '0');
        gradient.setAttribute('y2', '1');
        
        // Add gradient stops
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', color);
        stop1.setAttribute('stop-opacity', '0.2');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', color);
        stop2.setAttribute('stop-opacity', '0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        
        // Add defs to SVG
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Create path for the area
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Generate area path data
        let areaPathData = 'M ';
        data.forEach((value, index) => {
            const x = (index / (points - 1)) * width;
            const y = height - ((value - min) / range) * height * 0.8;
            areaPathData += `${x},${y} `;
            if (index === 0) areaPathData += 'L ';
        });
        
        // Add fill
        areaPathData += `${width},${height} L 0,${height} Z`;
        
        // Set area path attributes
        areaPath.setAttribute('d', areaPathData);
        areaPath.setAttribute('fill', `url(#${gradient.id})`);
        
        // Create path for the line
        const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Generate line path data
        let linePathData = 'M ';
        data.forEach((value, index) => {
            const x = (index / (points - 1)) * width;
            const y = height - ((value - min) / range) * height * 0.8;
            linePathData += `${x},${y} `;
            if (index === 0) linePathData += 'L ';
        });
        
        // Set line path attributes
        linePath.setAttribute('d', linePathData);
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('stroke', color);
        linePath.setAttribute('stroke-width', '2');
        linePath.setAttribute('stroke-linecap', 'round');
        linePath.setAttribute('stroke-linejoin', 'round');
        
        // Add paths to SVG
        svg.appendChild(areaPath);
        svg.appendChild(linePath);
        
        // Add SVG to container
        $container.append(svg);
    }
    
    // Handle time period button clicks with enhanced animation
    $('.time-btn').on('click', function() {
        const $btn = $(this);
        const period = $btn.data('period');
        
        if (period === currentPeriod) return;  // Skip if same period
        
        // Remove active class from all buttons
        $('.time-btn').removeClass('active');
        
        // Add active class and animation to clicked button
        $btn.addClass('active');
        
        // Add click animation
        $btn.addClass('pulse');
        setTimeout(() => $btn.removeClass('pulse'), 300);
        
        // Update metrics and charts for selected period
        updateMetrics(period);
        updateCorrelationChart(period);
    });
    
    // Initialize with default period (24h)
    // Set active class on 24h button immediately
    $('.time-btn[data-period="24h"]').addClass('active');
    
    // Initialize the metrics with 24h period after ensuring XML search managers are handled
    const xmlSearchManagers = ['notable_count_24h', 'notable_trend_24h', 'notable_percentage_24h'];
    xmlSearchManagers.forEach(id => {
        const search = mvc.Components.get(id);
        if (search) {
            search.settings.set('refresh', 0);
            search.cancel();
            mvc.Components.revokeInstance(id);
        }
    });
    
    // Now initialize with 24h period
    updateMetrics('24h');
    updateCorrelationChart('24h');
    updateActivityCenter();

    // Initialize the main chart
    const mainChartCtx = document.getElementById('mainChart').getContext('2d');
    let mainChart = null;

    // Function to format time labels based on period
    function formatTimeLabel(timestamp, period) {
        const date = new Date(timestamp);
        switch(period) {
            case '24h':
                return date.getHours().toString().padStart(2, '0') + ':00';
            case '7D':
                return date.getDate().toString();
            case '30D':
                return date.getDate().toString();
            default:
                return date.getHours().toString().padStart(2, '0') + ':00';
        }
    }

    function initializeMainChart(data) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        // If chart already exists, destroy it
        if (mainChart) {
            mainChart.destroy();
        }
        
        mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels.map(label => formatTimeLabel(label, currentPeriod)),
                datasets: [
                    {
                        label: 'Notable Events',
                        data: data.notable,
                        borderColor: '#6495ED',
                        backgroundColor: 'rgba(100, 149, 237, 0.1)',
                        tension: 0.4,
                        fill: true,
                        hidden: false
                    },
                    {
                        label: 'Critical Events',
                        data: data.critical,
                        borderColor: '#ff6b81',
                        backgroundColor: 'rgba(255, 107, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        hidden: false
                    },
                    {
                        label: 'High Events',
                        data: data.high,
                        borderColor: '#ffa502',
                        backgroundColor: 'rgba(255, 165, 2, 0.1)',
                        tension: 0.4,
                        fill: true,
                        hidden: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            // Prevent default legend click behavior
                            e.stopPropagation();
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
                            title: function(context) {
                                const label = context[0].label;
                                switch(currentPeriod) {
                                    case '24h':
                                        return `Time: ${label}`;
                                    case '7D':
                                    case '30D':
                                        return `Day: ${label}`;
                                    default:
                                        return label;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: currentPeriod === '24h' ? 12 : 10,
                            padding: 5,
                            font: {
                                size: 11
                            },
                            callback: function(value, index, values) {
                                const label = this.getLabelForValue(value);
                                switch(currentPeriod) {
                                    case '24h':
                                        return label + 'h';
                                    case '7D':
                                    case '30D':
                                        return label;
                                    default:
                                        return label;
                                }
                            },
                            afterFit: function(scaleInstance) {
                                scaleInstance.height = 20; // Reduce x-axis height
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            padding: 5,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    function updateMainChart(period) {
        // Show loading for chart
        toggleChartLoading(true);
        
        // Get the existing search managers
        const { trendManager, criticalTrendManager, electricityTrendManager } = searchManagers;
        
        let notableData = [];
        let criticalData = [];
        let highData = [];
        let timeLabels = [];
        let completedSearches = 0;

        // Attach event handlers only if they haven't been attached yet
        if (!trendManager.hasEventHandler) {
            // Get Notable Events trend data
            const notableResults = trendManager.data('results');
            notableResults.on('data', function() {
                const data = notableResults.data();
                if (data && data.rows) {
                    timeLabels = data.rows.map(row => row[0]);
                    notableData = data.rows.map(row => parseInt(row[1]) || 0);
                    completedSearches++;
                    checkAllSearchesComplete();
                }
            });
            trendManager.hasEventHandler = true;
        }

        if (!criticalTrendManager.hasEventHandler) {
            // Get Critical Events trend data
            const criticalResults = criticalTrendManager.data('results');
            criticalResults.on('data', function() {
                const data = criticalResults.data();
                if (data && data.rows) {
                    criticalData = data.rows.map(row => parseInt(row[1]) || 0);
                    completedSearches++;
                    checkAllSearchesComplete();
                }
            });
            criticalTrendManager.hasEventHandler = true;
        }

        if (!electricityTrendManager.hasEventHandler) {
            // Get High Events trend data
            const highResults = electricityTrendManager.data('results');
            highResults.on('data', function() {
                const data = highResults.data();
                if (data && data.rows) {
                    highData = data.rows.map(row => parseInt(row[1]) || 0);
                    completedSearches++;
                    checkAllSearchesComplete();
                }
            });
            electricityTrendManager.hasEventHandler = true;
        }

        function checkAllSearchesComplete() {
            if (completedSearches === 3) {
                // All data is available, update the chart
                initializeMainChart({
                    labels: timeLabels,
                    notable: notableData,
                    critical: criticalData,
                    high: highData
                });
                // Hide loading
                toggleChartLoading(false);
            }
        }
    }

    // Handle chart filter buttons
    $(document).on('click', '.chart-filters .filter-btn', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const filter = $btn.data('filter');
        
        // Remove active class from all buttons
        $('.chart-filters .filter-btn').removeClass('active');
        // Add active class to clicked button
        $btn.addClass('active');
        
        // Show/hide datasets based on filter
        if (mainChart) {
            mainChart.data.datasets.forEach(dataset => {
                switch (filter) {
                    case 'all':
                        dataset.hidden = false;
                        break;
                    case 'notable':
                        dataset.hidden = dataset.label !== 'Notable Events';
                        break;
                    case 'critical':
                        dataset.hidden = dataset.label !== 'Critical Events';
                        break;
                    case 'high':
                        dataset.hidden = dataset.label !== 'High Events';
                        break;
                    default:
                        dataset.hidden = false;
                }
            });
            mainChart.update();
        }
    });

    // Initialize with default period (24h)
    updateMainChart('24h');

    // Add animation for progress circles on page load
    document.addEventListener('DOMContentLoaded', function() {
        const circles = document.querySelectorAll('.progress');
        circles.forEach((circle, index) => {
            setTimeout(() => {
                circle.style.opacity = '1';
                circle.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });

    // Initialize correlation events chart
    let correlationChart = null;

    function updateCorrelationChart(period) {
        const $container = $('.correlation-events .chart-container');
        const $loading = $container.find('.loading-animation');
        
        $container.addClass('loading');
        $loading.show();

        const span = {
            '24h': '1h',
            '7D': '6h',
            '30D': '1d'
        }[period];

        const timeRange = {
            '24h': '-24h',
            '7D': '-7d',
            '30D': '-30d'
        }[period];

        // Cancel existing search if it exists
        const existingManager = mvc.Components.get(`correlation_events_${period}`);
        if (existingManager) {
            existingManager.cancel();
            mvc.Components.revokeInstance(`correlation_events_${period}`);
        }

        // Create search manager for correlation events
        const correlationManager = new SearchManager({
            id: `correlation_events_${period}`,
            search: `index=soc_notable sourcetype=soc_notable:log 
                    | eval search_name=if(isnull(search_name), "Unknown", search_name)
                    | timechart span=${span} count by search_name useother=false 
                    | fields - _span
                    | fillnull value=0`,
            earliest_time: timeRange,
            latest_time: 'now',
            autostart: true,
            preview: true,
            cache: false,
            status_buckets: 300,
            required_field_list: "*",
            app: "cyber_watch"
        });

        correlationManager.on('search:done', function() {
            const results = correlationManager.data('results');
            results.on('data', function() {
                const data = results.data();
                console.log('Correlation chart data:', data); // Debug log
                
                if (data && data.rows && data.fields) {
                    const labels = data.rows.map(row => formatTimeLabel(row[0], period));
                    const searchNames = data.fields.slice(1); // Remove _time field
                    
                    const datasets = searchNames.map((name, index) => ({
                        label: name,
                        data: data.rows.map(row => parseInt(row[index + 1]) || 0),
                        backgroundColor: getRandomColor(index),
                        stack: 'stack1'
                    }));

                    console.log('Correlation chart datasets:', datasets); // Debug log
                    initializeCorrelationChart({ labels, datasets });
                } else {
                    console.error('Invalid correlation data structure:', data);
                }
                
                $container.removeClass('loading');
                $loading.hide();
            });

            results.on('error', function(err) {
                console.error('Correlation search error:', err);
                $container.removeClass('loading');
                $loading.hide();
            });
        });

        correlationManager.startSearch();
    }

    function initializeCorrelationChart(data) {
        const ctx = document.getElementById('correlationChart').getContext('2d');
        
        if (correlationChart) {
            correlationChart.destroy();
        }

        correlationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: 12
                            }
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
                        usePointStyle: true
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    function getRandomColor(index) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
            '#E67E22', '#2ECC71', '#1ABC9C', '#F1C40F'
        ];
        return colors[index % colors.length];
    }

    function updateActivityCenter() {
        const $container = $('.activity-center .activity-container');
        const $loading = $container.find('.loading-animation');
        const $timeline = $container.find('.activity-timeline');
        
        $container.addClass('loading');
        $loading.show();

        // Cancel existing search manager if it exists
        const existingManager = mvc.Components.get('activity_timeline');
        if (existingManager) {
            existingManager.cancel();
            mvc.Components.revokeInstance('activity_timeline');
        }

        // Create search manager for activity timeline
        const activityManager = new SearchManager({
            id: 'activity_timeline',
            search: `
                index=soc_notable OR index=soc_summary 
                | eval activity_type=case(match(source,"updateOwner"),"owner_change", match(source,"updateStatus"),"status_change", match(source,"socnotable.json"),"notable_created", match(source,"addWorknote"),"work_note_added", 1=1,0)
                | eval activity_description=case(
                    activity_type="owner_change", "Owner changed to " . owner,
                    activity_type="status_change", "Status updated to " . status,
                    activity_type="work_note_added", "Work note added: " . worknote,
                    activity_type="notable_created", "Notable incident created"
                    ) 
                | eval _time=strftime(_time, "%Y-%m-%d %H:%M:%S")
                | where activity_type != "0"
                | table _time, activity_type, activity_description, inc_number
                | sort - _time 
                | head 15
            `,
            earliest_time: '-24h',
            latest_time: 'now',
            autostart: true,
            preview: true,
            cache: false,
            status_buckets: 300,
            required_field_list: "*",
            app: "cyber_watch"
        });

        activityManager.on('search:done', function() {
            const results = activityManager.data('results');
            results.on('data', function() {
                const data = results.data();
                if (data && data.rows) {
                    // Clear existing content
                    $timeline.empty();

                    // Process each activity
                    data.rows.forEach(row => {
                        try {
                            const timestamp = new Date(row[0]);
                            const activityType = row[1];
                            const description = row[2];
                            const incNumber = row[3] || 'N/A';
                            
                            // Skip invalid activities
                            if (!activityType || activityType === "0") return;
                            
                            // Create activity item
                            const $activityItem = $('<div class="activity-item"></div>')
                                .addClass(activityType.replace('_', '-'));
                            
                            // Create activity header
                            const $header = $('<div class="activity-header"></div>');
                            
                            // Add icon based on activity type
                            const iconClass = getActivityIcon(activityType);
                            const $icon = $(`<div class="activity-icon"><i class="${iconClass}"></i></div>`);
                            
                            // Create content section
                            const $content = $('<div class="activity-content"></div>');
                            
                            // Add title and time
                            const $title = $('<h3 class="activity-title"></h3>')
                                .html(`<span class="incident-number">${_.escape(incNumber)}</span> ${getActivityTitle(activityType)}`);
                            
                            const $time = $('<span class="activity-time"></span>')
                                .text(formatTimestamp(timestamp));
                            
                            // Add description
                            const $description = $('<p class="activity-description"></p>')
                                .text(description || 'No description available');
                            
                            // Assemble the components
                            $content.append($title, $time);
                            $header.append($icon, $content);
                            $activityItem.append($header, $description);
                            
                            // Add to timeline
                            $timeline.append($activityItem);
                        } catch (error) {
                            console.error('Error processing activity:', error, row);
                        }
                    });
                }
                
                $container.removeClass('loading');
                $loading.hide();
            });
        });

        activityManager.startSearch();
    }

    // Helper function to get appropriate icon for activity type
    function getActivityIcon(type) {
        switch(type) {
            case 'notable_created':
                return 'fas fa-exclamation-circle';
            case 'owner_change':
                return 'fas fa-user-edit';
            case 'status_change':
                return 'fas fa-sync-alt';
            case 'work_note_added':
                return 'fas fa-comment-dots';
            default:
                return 'fas fa-info-circle';
        }
    }

    // Helper function to get activity title
    function getActivityTitle(type) {
        switch(type) {
            case 'notable_created':
                return 'Notable Triggered';
            case 'owner_change':
                return 'Owner Updated';
            case 'status_change':
                return 'Status Changed';
            case 'work_note_added':
                return 'Work Note Added';
            default:
                return 'Activity Update';
        }
    }

    // Helper function to format timestamp
    function formatTimestamp(date) {
        const now = new Date();
        const diff = now - date;
        
        // If less than 24 hours ago, show relative time
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            if (hours === 0) {
                const minutes = Math.floor(diff / (60 * 1000));
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            }
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        
        // Otherwise show the date
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    // Add toast notification container to the DOM
    $('body').append(`
        <div id="toast-container" style="
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        "></div>
    `);

    function showToast(message, type = 'info') {
        const toast = $(`
            <div class="toast ${type}" style="
                background: ${type === 'info' ? '#60a5fa' : '#ef4444'};
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                margin-bottom: 10px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                pointer-events: auto;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <i class="fas ${type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'}"></i>
                ${message}
            </div>
        `);
        
        $('#toast-container').append(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.css({
                'opacity': '1',
                'transform': 'translateY(0)'
            });
        });
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.css({
                'opacity': '0',
                'transform': 'translateY(-20px)'
            });
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Update the auto-refresh toggle handler
    $('#autoRefreshToggle').on('change', function() {
        const isChecked = $(this).prop('checked');
        $('.auto-refresh .status').text(isChecked ? 'On' : 'Off');
        
        showToast(`Auto-refresh is now ${isChecked ? 'enabled' : 'disabled'}`, 'info');
        
        if (isChecked) {
            // Start auto-refresh interval (every 5 minutes)
            window.activityRefreshInterval = setInterval(updateActivityCenter, 5 * 60 * 1000);
        } else {
            // Clear auto-refresh interval
            if (window.activityRefreshInterval) {
                clearInterval(window.activityRefreshInterval);
            }
        }
    });
}); 