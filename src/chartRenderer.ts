// ===== CHART RENDERING UTILITIES =====
// Handles Chart.js chart creation and interaction

import type { ManagerChartModel, ChartType } from './types.js';

// Type definitions for Chart.js
declare const Chart: any;

export class ChartRenderer {
    private chart: any = null;
    private selectedManagers: Set<string> = new Set();
    
    /**
     * Create or update a chart
     */
    public renderChart(
        canvasId: string,
        managers: ManagerChartModel[],
        chartType: ChartType,
        legendContainerId: string
    ): void {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            console.error(`Canvas element not found: ${canvasId}`);
            return;
        }
        
        // Destroy existing chart on this instance
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Destroy any chart that might exist on this canvas from Chart.js registry
        const existingChart = Chart.getChart(canvasId);
        if (existingChart) {
            console.log(`🗑️ Destroying existing chart on canvas: ${canvasId}`);
            existingChart.destroy();
        }
        
        // Reset selected managers
        this.selectedManagers.clear();
        
        // Create datasets for Chart.js
        const datasets = managers.map(manager => ({
            label: manager.name,
            data: this.prepareDataPoints(manager.gwValues, chartType),
            borderColor: manager.color,
            backgroundColor: manager.color,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.1,
            hidden: false
        }));
        
        // Get gameweek labels
        const maxGW = Math.max(...managers.map(m => m.gwValues.length));
        const labels = Array.from({ length: maxGW }, (_, i) => i + 1);
        
        // Chart configuration
        const config = {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false // Using custom legend
                    },
                    title: {
                        display: true,
                        text: chartType === 'absolute' 
                            ? 'Match Points Over Time' 
                            : 'League Position Over Time',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (context: any) => {
                                return `Gameweek ${context[0].label}`;
                            },
                            label: (context: any) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                if (chartType === 'relative') {
                                    return `${label}: Position ${value}`;
                                }
                                return `${label}: ${value} points`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Gameweek'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartType === 'absolute' ? 'Match Points' : 'Position'
                        },
                        reverse: chartType === 'relative', // Lower position number is better
                        ticks: {
                            stepSize: chartType === 'relative' ? 1 : undefined,
                            callback: (value: any) => {
                                if (chartType === 'relative') {
                                    return value; // Position 1, 2, 3, etc.
                                }
                                return value;
                            }
                        },
                        ...(chartType === 'relative' ? {
                            min: 1,
                            max: managers.length
                        } : {})
                    }
                }
            }
        };
        
        // Create chart
        this.chart = new Chart(canvas, config);
        
        // Render custom legend
        this.renderLegend(legendContainerId, managers);
    }
    
    /**
     * Prepare data points for the chart
     */
    private prepareDataPoints(values: number[], chartType: ChartType): number[] {
        if (chartType === 'relative') {
            // For relative chart, data is already position values
            return values;
        }
        // For absolute chart, data is match points
        return values;
    }
    
    /**
     * Render custom interactive legend
     */
    private renderLegend(containerId: string, managers: ManagerChartModel[]): void {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Legend container not found: ${containerId}`);
            return;
        }
        
        container.innerHTML = '';
        
        const legendWrapper = document.createElement('div');
        legendWrapper.className = 'chart-legend-wrapper';
        
        managers.forEach((manager, index) => {
            const legendItem = document.createElement('button');
            legendItem.className = 'chart-legend-item';
            legendItem.setAttribute('data-manager', manager.name);
            legendItem.setAttribute('data-index', String(index));
            
            // Color indicator
            const colorBox = document.createElement('span');
            colorBox.className = 'chart-legend-color';
            colorBox.style.backgroundColor = manager.color;
            
            // Manager name
            const nameText = document.createElement('span');
            nameText.className = 'chart-legend-name';
            nameText.textContent = manager.name;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(nameText);
            
            // Click handler for highlighting
            legendItem.addEventListener('click', () => {
                this.toggleManagerHighlight(manager.name, index);
            });
            
            legendWrapper.appendChild(legendItem);
        });
        
        container.appendChild(legendWrapper);
    }
    
    /**
     * Toggle manager highlight in chart
     */
    private toggleManagerHighlight(managerName: string, _datasetIndex: number): void {
        if (!this.chart) return;
        
        if (this.selectedManagers.has(managerName)) {
            // Remove from selection
            this.selectedManagers.delete(managerName);
        } else {
            // Add to selection
            this.selectedManagers.add(managerName);
        }
        
        // Update dataset opacity
        this.chart.data.datasets.forEach((dataset: any) => {
            if (this.selectedManagers.size === 0) {
                // No selection - show all
                dataset.borderWidth = 2;
                dataset.backgroundColor = dataset.borderColor;
                this.setDatasetOpacity(dataset, 1.0);
            } else if (this.selectedManagers.has(dataset.label)) {
                // Selected - full opacity
                dataset.borderWidth = 3;
                this.setDatasetOpacity(dataset, 1.0);
            } else {
                // Not selected - reduced opacity
                dataset.borderWidth = 2;
                this.setDatasetOpacity(dataset, 0.1);
            }
        });
        
        // Update legend styling
        const legendItems = document.querySelectorAll('.chart-legend-item');
        legendItems.forEach((item: Element) => {
            const itemName = item.getAttribute('data-manager');
            if (this.selectedManagers.size === 0) {
                item.classList.remove('dimmed', 'highlighted');
            } else if (itemName && this.selectedManagers.has(itemName)) {
                item.classList.add('highlighted');
                item.classList.remove('dimmed');
            } else {
                item.classList.add('dimmed');
                item.classList.remove('highlighted');
            }
        });
        
        this.chart.update();
    }
    
    /**
     * Set opacity for a dataset
     */
    private setDatasetOpacity(dataset: any, opacity: number): void {
        const color = dataset.borderColor;
        if (typeof color === 'string' && color.startsWith('rgb')) {
            const rgbMatch = color.match(/\d+/g);
            if (rgbMatch) {
                dataset.borderColor = `rgba(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}, ${opacity})`;
                dataset.backgroundColor = `rgba(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}, ${opacity})`;
            }
        }
    }
    
    /**
     * Destroy chart instance
     */
    public destroy(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
