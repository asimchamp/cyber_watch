require.config({
    paths: {
        'chart': '../js/lib/chart.min'
    },
    shim: {
        'chart': {
            exports: 'Chart'
        }
    }
}); 