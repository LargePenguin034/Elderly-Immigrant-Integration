class TranslationQueue {
    constructor(maxConcurrent, maxQueue) {
      this.maxConcurrent = maxConcurrent; // Maximum number of concurrent translations
      this.maxQueue = maxQueue;           // Maximum number of tasks in the queue
      this.current = 0;                   // Current number of active translations
      this.queue = [];                    // Queue to hold pending translation tasks
    }
  
    /**
     * Adds a translation task to the queue.
     * If concurrency limit is not reached, starts the task immediately.
     * If the queue is full, removes the oldest task before adding the new one.
     * @param {Function} task - The translation task to execute.
     */
    enqueue(task) {
      if (this.current < this.maxConcurrent) {
        this.current++;
        this.runTask(task);
      } else {
        if (this.queue.length >= this.maxQueue) {
          // Remove the oldest task in the queue
          const removedTask = this.queue.shift();
          console.log('Translation queue full. Removing the oldest pending task.');
        }
        // Add the new task to the queue
        this.queue.push(task);
        console.log('Added translation task to the queue. Current queue size:', this.queue.length);
      }
    }
  
    /**
     * Executes a translation task.
     * @param {Function} task - The translation task to execute.
     */
    async runTask(task) {
      try {
        await task();
      } catch (err) {
        console.error('Error in translation task:', err);
      } finally {
        this.current--;
        this.dequeue();
      }
    }
  
    /**
     * Processes the next task in the queue, if any.
     */
    dequeue() {
      if (this.queue.length > 0 && this.current < this.maxConcurrent) {
        const nextTask = this.queue.shift();
        this.current++;
        this.runTask(nextTask);
      }
    }
  
    /**
     * Waits until all active and queued translation tasks are completed.
     * Useful for ensuring all translations are sent before closing the WebSocket.
     */
    async waitUntilEmpty() {
      while (this.current > 0 || this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before checking again
      }
    }
  }
  
  module.exports = TranslationQueue;
  