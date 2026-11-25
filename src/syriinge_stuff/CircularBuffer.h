#pragma once

template <typename T, int MAX_SIZE>
class CircularBuffer<T, MAX_SIZE> {
private:
    int newest;
    int oldest;
    int count;
    T array[MAX_SIZE] = {};

public:
    CircularBuffer(): newest(0), oldest(0), count(0) {}

    bool isEmpty() { return count == 0; }
    int getCount() { return count; }

    T getNewest() {
        if (isEmpty()) {
            return NULL;
        }
        return arr[newest];
    }

    T getOldest() {
        if (isEmpty()) {
            return NULL;
        }
        return arr[oldest];
    }

    T getElementAt(int idx) {
        idx = newest - idx;
        if (idx < 0) {
            idx += MAX_SIZE;
        }
        return arr[idx];
    }


    void push(T val) {
        arr[newest] = val;
        newest = (newest + 1) % MAX_SIZE;
        if (newest == oldest) {
            oldest = (oldest + 1) % MAX_SIZE;
        }
        if (count < MAX_SIZE) count ++;
    }
}
