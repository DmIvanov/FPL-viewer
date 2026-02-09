"use strict";

console.log('🚀 Minimal script starting...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM ready - minimal version');
    
    // Test if we can find the cup table
    const tableBody = document.getElementById('cup-table-body');
    
    if (tableBody) {
        console.log('✅ Found cup-table-body');
        tableBody.innerHTML = `
            <tr>
                <td>1</td>
                <td>Test Manager</td>
                <td>Test Team</td>
                <td>1000</td>
                <td>50</td>
                <td>1</td>
            </tr>
        `;
        console.log('✅ Added test row to table');
    } else {
        console.log('❌ Could not find cup-table-body element');
    }
    
    // Test basic tab switching
    const cupSection = document.getElementById('cup');
    const chartsSection = document.getElementById('charts');
    
    if (cupSection) {
        console.log('✅ Found cup section');
        cupSection.style.display = 'block';
    } else {
        console.log('❌ Could not find cup section');
    }
    
    if (chartsSection) {
        console.log('✅ Found charts section');
        chartsSection.style.display = 'none';
    } else {
        console.log('❌ Could not find charts section');
    }
    
    console.log('🎉 Minimal script completed successfully');
});