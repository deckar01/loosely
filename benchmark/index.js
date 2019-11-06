import microBenchmark from 'micro-benchmark';
import { Mask, ReverseMask } from '../src';
 
const N = 10;
const mask = new Mask(/(\d{1,3},)*\d{1,3}/);
const reverseMask = new ReverseMask(/(\d{1,3},)*\d{1,3}/);

const result = microBenchmark.suite({
    duration: 100,
    maxOperations: 1000,
    specs: [
        {
            name: 'Recursive (10)',
            fn: () => mask.filter('1234567890'),
        },
        {
            name: 'Recursive (20)',
            fn: () => mask.filter('12345678901234567890'),
        },
        {
            name: 'Recursive (21)',
            fn: () => mask.filter('123456789012345678901'),
        },
        {
            name: 'Recursive (22)',
            fn: () => mask.filter('1234567890123456789012'),
        },
        {
            name: 'Reverse Recursive (10)',
            fn: () => reverseMask.filter('1234567890'),
        },
        {
            name: 'Reverse Recursive (20)',
            fn: () => reverseMask.filter('12345678901234567890'),
        },
        {
            name: 'Reverse Recursive (21)',
            fn: () => reverseMask.filter('123456789012345678901'),
        },
        {
            name: 'Reverse Recursive (22)',
            fn: () => reverseMask.filter('1234567890123456789012'),
        }
    ]
});
 
const report = microBenchmark.report(result, { chartWidth: 10 });
console.log(report);
