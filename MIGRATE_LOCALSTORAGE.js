// ONE-TIME MIGRATION SCRIPT FOR BROWSER CONSOLE
// Run this in Chrome DevTools Console to migrate old localStorage data

(function migrateLocalStorage() {
    console.log('🔄 Starting localStorage migration...');

    const migrations = [
        // Profile data migration
        {
            oldKeys: ['profile', 'careerAgentProfile', 'user_profile'],
            newKey: 'cap_profile'
        },
        // Jobs data migration
        {
            oldKeys: ['analyzedJobs', 'savedJobs', 'jobs', 'analyzed_jobs'],
            newKey: 'cap_analyzedJobs'
        },
        // Current job migration
        {
            oldKeys: ['currentJobForResume', 'currentJob', 'selectedJob', 'targetJob', 'jobForResume'],
            newKey: 'cap_currentJobForResume'
        }
    ];

    let migratedCount = 0;

    migrations.forEach(({ oldKeys, newKey }) => {
        // Check if new key already has data
        const existingData = localStorage.getItem(newKey);
        if (existingData) {
            console.log(`✅ ${newKey} already has data, skipping migration`);
            return;
        }

        // Try to find data in old keys
        for (const oldKey of oldKeys) {
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                try {
                    // Verify it's valid JSON
                    JSON.parse(oldData);

                    // Copy to new key
                    localStorage.setItem(newKey, oldData);
                    console.log(`✅ Migrated ${oldKey} → ${newKey}`);
                    migratedCount++;
                    break; // Stop after first successful migration
                } catch (e) {
                    console.warn(`⚠️  ${oldKey} contains invalid JSON, skipping`);
                }
            }
        }
    });

    console.log(`\n🎉 Migration complete! Migrated ${migratedCount} key(s).`);
    console.log('📊 Current localStorage state:');
    console.log({
        'cap_profile': localStorage.getItem('cap_profile') ? '✅ Present' : '❌ Missing',
        'cap_analyzedJobs': localStorage.getItem('cap_analyzedJobs') ? '✅ Present' : '❌ Missing',
        'cap_currentJobForResume': localStorage.getItem('cap_currentJobForResume') ? '✅ Present' : '❌ Missing'
    });
    console.log('\n🔄 Please refresh the page to see your data.');
})();
