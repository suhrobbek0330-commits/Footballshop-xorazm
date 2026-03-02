const cron = require('node-cron');
const debtService = require('../services/debtService');

const startCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running detailed debt check...');
        try {
            await debtService.checkOverdueDebts();
            console.log('Debt check completed.');
        } catch (error) {
            console.error('Error in debt check cron job:', error);
        }
    });
};

module.exports = startCronJobs;
