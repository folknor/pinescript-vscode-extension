/**
 * Pine Script V6 Functions
 * Auto-generated from TradingView documentation
 * Generated: 2025-12-24T18:19:57.274Z
 * Total: 457 functions
 */

import type { PineFunction } from "../schema/types";

/**
 * All v6 functions as an array
 */
export const FUNCTIONS: PineFunction[] = [
  {
    "name": "alert",
    "syntax": "alert(message, freq) → void",
    "description": "Creates an alert trigger for an indicator or strategy, with a specified frequency, when called on the latest realtime bar. To activate alerts for a script containing calls to this function, open the \"Create Alert\" dialog box, then select the script name and \"Any alert() function call\" in the \"Condition\" section.",
    "parameters": [
      {
        "name": "message",
        "type": "series string",
        "description": "The message to send when the alert occurs.",
        "required": false
      },
      {
        "name": "freq",
        "type": "input string",
        "description": "Optional. Determines the allowed frequency of the alert trigger. Possible values are: alert.freq_all (allows an alert on any realtime update), alert.freq_once_per_bar (allows an alert only on the first execution for each realtime bar), or alert.freq_once_per_bar_close (allows an alert only when a realtime bar closes). The default is alert.freq_once_per_bar.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`alert()` example\", \"\", true)ma = ta.sma(close, 14)xUp = ta.crossover(close, ma)if xUp    // Trigger the alert the first time a cross occurs during the real-time bar.    alert(\"Price (\" + str.tostring(close) + \") crossed over MA (\" + str.tostring(ma) + \").\", alert.freq_once_per_bar)plot(ma)plotchar(xUp, \"xUp\", \"▲\", location.top, size = size.tiny)"
  },
  {
    "name": "alertcondition",
    "syntax": "alertcondition(condition, title, message) → void",
    "description": "Creates alert condition, that is available in Create Alert dialog. Please note, that alertcondition() does NOT create an alert, it just gives you more options in Create Alert dialog. Also, alertcondition() effect is invisible on chart.",
    "parameters": [
      {
        "name": "condition",
        "type": "series bool",
        "description": "Series of boolean values that is used for alert. True values mean alert fire, false - no alert. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the alert condition. Optional argument.",
        "required": false
      },
      {
        "name": "message",
        "type": "const string",
        "description": "Message to display when alert fires. Optional argument.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"alertcondition\", overlay=true)alertcondition(close >= open, title='Alert on Green Bar', message='Green Bar!')"
  },
  {
    "name": "array.abs",
    "namespace": "array",
    "syntax": "array.abs(id) → array<float>",
    "description": "Returns an array containing the absolute value of each element in the original array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "array<float>",
    "example": ""
  },
  {
    "name": "array.avg",
    "namespace": "array",
    "syntax": "array.avg(id) → series float",
    "description": "The function returns the mean of an array's elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.avg example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.avg(a))"
  },
  {
    "name": "array.binary_search",
    "namespace": "array",
    "syntax": "array.binary_search(id, val) → series int",
    "description": "The function returns the index of the value, or -1 if the value is not found. The array to search must be sorted in ascending order.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "val",
        "type": "series int/float",
        "description": "The value to search for in the array.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.binary_search\")a = array.from(5, -2, 0, 9, 1)array.sort(a) // [-2, 0, 1, 5, 9]position = array.binary_search(a, 0) // 1plot(position)"
  },
  {
    "name": "array.binary_search_leftmost",
    "namespace": "array",
    "syntax": "array.binary_search_leftmost(id, val) → series int",
    "description": "The function returns the index of the value if it is found. When the value is not found, the function returns the index of the next smallest element to the left of where the value would lie if it was in the array. The array to search must be sorted in ascending order.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "val",
        "type": "series int/float",
        "description": "The value to search for in the array.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.binary_search_leftmost\")a = array.from(5, -2, 0, 9, 1)array.sort(a) // [-2, 0, 1, 5, 9]position = array.binary_search_leftmost(a, 3) // 2plot(position)"
  },
  {
    "name": "array.binary_search_rightmost",
    "namespace": "array",
    "syntax": "array.binary_search_rightmost(id, val) → series int",
    "description": "The function returns the index of the value if it is found. When the value is not found, the function returns the index of the element to the right of where the value would lie if it was in the array. The array must be sorted in ascending order.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "val",
        "type": "series int/float",
        "description": "The value to search for in the array.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.binary_search_rightmost\")a = array.from(5, -2, 0, 9, 1)array.sort(a) // [-2, 0, 1, 5, 9]position = array.binary_search_rightmost(a, 3) // 3plot(position)"
  },
  {
    "name": "array.clear",
    "namespace": "array",
    "syntax": "array.clear(id) → void",
    "description": "The function removes all elements from an array.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.clear example\")a = array.new_float(5,high)array.clear(a)array.push(a, close)plot(array.get(a,0))plot(array.size(a))"
  },
  {
    "name": "array.concat",
    "namespace": "array",
    "syntax": "array.concat(id1, id2) → array<type>",
    "description": "The function is used to merge two arrays. It pushes all elements from the second array to the first array, and returns the first array.",
    "parameters": [
      {
        "name": "id1",
        "type": "any array type",
        "description": "The first array object.",
        "required": false
      },
      {
        "name": "id2",
        "type": "any array type",
        "description": "The second array object.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"array.concat example\")a = array.new_float(0,0)b = array.new_float(0,0)for i = 0 to 4    array.push(a, high[i])    array.push(b, low[i])c = array.concat(a,b)plot(array.size(a))plot(array.size(b))plot(array.size(c))"
  },
  {
    "name": "array.copy",
    "namespace": "array",
    "syntax": "array.copy(id) → array<type>",
    "description": "The function creates a copy of an existing array.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"array.copy example\")length = 5a = array.new_float(length, close)b = array.copy(a)a := array.new_float(length, open)plot(array.sum(a) / length)plot(array.sum(b) / length)"
  },
  {
    "name": "array.covariance",
    "namespace": "array",
    "syntax": "array.covariance(id1, id2, biased) → series float",
    "description": "The function returns the covariance of two arrays.",
    "parameters": [
      {
        "name": "id1",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "id2",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "biased",
        "type": "series bool",
        "description": "Determines which estimate should be used. Optional. The default is true.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"array.covariance example\")a = array.new_float(0)b = array.new_float(0)for i = 0 to 9    array.push(a, close[i])    array.push(b, open[i])plot(array.covariance(a, b))"
  },
  {
    "name": "array.every",
    "namespace": "array",
    "syntax": "array.every(id) → series bool",
    "description": "Returns true if all elements of the id array are true, false otherwise.",
    "parameters": [
      {
        "name": "id",
        "type": "array<bool>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "array.fill",
    "namespace": "array",
    "syntax": "array.fill(id, value, index_from, index_to) → void",
    "description": "The function sets elements of an array to a single value. If no index is specified, all elements are set. If only a start index (default 0) is supplied, the elements starting at that index are set. If both index parameters are used, the elements from the starting index up to but not including the end index (default na) are set.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "Value to fill the array with.",
        "required": false
      },
      {
        "name": "index_from",
        "type": "series int",
        "description": "Start index, default is 0.",
        "required": false
      },
      {
        "name": "index_to",
        "type": "series int",
        "description": "End index, default is na. Must be one greater than the index of the last element to set.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.fill example\")a = array.new_float(10)array.fill(a, close)plot(array.sum(a))"
  },
  {
    "name": "array.first",
    "namespace": "array",
    "syntax": "array.first(id) → series <type>",
    "description": "Returns the array's first element. Throws a runtime error if the array is empty.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.first example\")arr = array.new_int(3, 10)plot(array.first(arr))"
  },
  {
    "name": "array.from",
    "namespace": "array",
    "syntax": "array.from(arg0, arg1, ...) → array<type>",
    "description": "The function takes a variable number of arguments with one of the types: int, float, bool, string, label, line, color, box, table, linefill, and returns an array of the corresponding type.",
    "parameters": [
      {
        "name": "arg0",
        "type": "unknown",
        "description": "",
        "required": true
      },
      {
        "name": "arg1",
        "type": "unknown",
        "description": "",
        "required": true
      }
    ],
    "returns": "array<type>",
    "flags": {
      "variadic": true,
      "minArgs": 1
    },
    "example": "//@version=6indicator(\"array.from_example\", overlay = false)arr = array.from(\"Hello\", \"World!\") // arr (array<string>) will contain 2 elements: {Hello}, {World!}.plot(close)"
  },
  {
    "name": "array.get",
    "namespace": "array",
    "syntax": "array.get(id, index) → series <type>",
    "description": "The function returns the value of the element at the specified index.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The index of the element whose value is to be returned.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.get example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i] - open[i])plot(array.get(a, 9))"
  },
  {
    "name": "array.includes",
    "namespace": "array",
    "syntax": "array.includes(id, value) → series bool",
    "description": "The function returns true if the value was found in an array, false otherwise.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value to search in the array.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": "//@version=6indicator(\"array.includes example\")a = array.new_float(5,high)p = closeif array.includes(a, high)    p := openplot(p)"
  },
  {
    "name": "array.indexof",
    "namespace": "array",
    "syntax": "array.indexof(id, value) → series int",
    "description": "The function returns the index of the first occurrence of the value, or -1 if the value is not found.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value to search in the array.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.indexof example\")a = array.new_float(5,high)index = array.indexof(a, high)plot(index)"
  },
  {
    "name": "array.insert",
    "namespace": "array",
    "syntax": "array.insert(id, index, value) → void",
    "description": "The function changes the contents of an array by adding new elements in place.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The index at which to insert the value.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value to add to the array.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.insert example\")a = array.new_float(5, close)array.insert(a, 0, open)plot(array.get(a, 5))"
  },
  {
    "name": "array.join",
    "namespace": "array",
    "syntax": "array.join(id, separator) → series string",
    "description": "The function creates and returns a new string by concatenating all the elements of an array, separated by the specified separator string.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float/string>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "separator",
        "type": "series string",
        "description": "The string used to separate each array element.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6indicator(\"array.join example\")a = array.new_float(5, 5)label.new(bar_index, close, array.join(a, \",\"))"
  },
  {
    "name": "array.last",
    "namespace": "array",
    "syntax": "array.last(id) → series <type>",
    "description": "Returns the array's last element. Throws a runtime error if the array is empty.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.last example\")arr = array.new_int(3, 10)plot(array.last(arr))"
  },
  {
    "name": "array.lastindexof",
    "namespace": "array",
    "syntax": "array.lastindexof(id, value) → series int",
    "description": "The function returns the index of the last occurrence of the value, or -1 if the value is not found.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value to search in the array.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.lastindexof example\")a = array.new_float(5,high)index = array.lastindexof(a, high)plot(index)"
  },
  {
    "name": "array.max",
    "namespace": "array",
    "syntax": "array.max(id, nth) → series float",
    "description": "The function returns the greatest value, or the nth greatest value in a given array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "nth",
        "type": "series int",
        "description": "The nth greatest value to return, where zero is the greatest. Optional. The default is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.max\")a = array.from(5, -2, 0, 9, 1)thirdHighest = array.max(a, 2) // 1plot(thirdHighest)"
  },
  {
    "name": "array.median",
    "namespace": "array",
    "syntax": "array.median(id) → series float",
    "description": "The function returns the median of an array's elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.median example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.median(a))"
  },
  {
    "name": "array.min",
    "namespace": "array",
    "syntax": "array.min(id, nth) → series float",
    "description": "The function returns the smallest value, or the nth smallest value in a given array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "nth",
        "type": "series int",
        "description": "The nth smallest value to return, where zero is the smallest. Optional. The default is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.min\")a = array.from(5, -2, 0, 9, 1)secondLowest = array.min(a, 1) // 0plot(secondLowest)"
  },
  {
    "name": "array.mode",
    "namespace": "array",
    "syntax": "array.mode(id) → series float",
    "description": "The function returns the mode of an array's elements. If there are several values with the same frequency, it returns the smallest value.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.mode example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.mode(a))"
  },
  {
    "name": "array.new<type>",
    "namespace": "array",
    "syntax": "array.new<type>(size, initial_value) → array<type>",
    "description": "The function creates a new array object of <type> elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "<array_type>",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"array.new<string> example\")a = array.new<string>(1, \"Hello, World!\")label.new(bar_index, close, array.get(a, 0))"
  },
  {
    "name": "array.new_bool",
    "namespace": "array",
    "syntax": "array.new_bool(size, initial_value) → array<bool>",
    "description": "The function creates a new array object of bool type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series bool",
        "description": "Initial value of all array elements. Optional. The default is 'false'.",
        "required": false
      }
    ],
    "returns": "array<bool>",
    "example": "//@version=6indicator(\"array.new_bool example\")length = 5a = array.new_bool(length, close > open)plot(array.get(a, 0) ? close : open)"
  },
  {
    "name": "array.new_box",
    "namespace": "array",
    "syntax": "array.new_box(size, initial_value) → array<box>",
    "description": "The function creates a new array object of box type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series box",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<box>",
    "example": "//@version=6indicator(\"array.new_box example\")boxes = array.new_box()array.push(boxes, box.new(time, close, time+2, low, xloc=xloc.bar_time))plot(1)"
  },
  {
    "name": "array.new_color",
    "namespace": "array",
    "syntax": "array.new_color(size, initial_value) → array<color>",
    "description": "The function creates a new array object of color type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series color",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<color>",
    "example": "//@version=6indicator(\"array.new_color example\")length = 5a = array.new_color(length, color.red)plot(close, color = array.get(a, 0))"
  },
  {
    "name": "array.new_float",
    "namespace": "array",
    "syntax": "array.new_float(size, initial_value) → array<float>",
    "description": "The function creates a new array object of float type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series int/float",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<float>",
    "example": "//@version=6indicator(\"array.new_float example\")length = 5a = array.new_float(length, close)plot(array.sum(a) / length)"
  },
  {
    "name": "array.new_int",
    "namespace": "array",
    "syntax": "array.new_int(size, initial_value) → array<int>",
    "description": "The function creates a new array object of int type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series int",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<int>",
    "example": "//@version=6indicator(\"array.new_int example\")length = 5a = array.new_int(length, int(close))plot(array.sum(a) / length)"
  },
  {
    "name": "array.new_label",
    "namespace": "array",
    "syntax": "array.new_label(size, initial_value) → array<label>",
    "description": "The function creates a new array object of label type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series label",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<label>",
    "example": "//@version=6indicator(\"array.new_label example\", overlay = true, max_labels_count = 500)//@variable The number of labels to show on the chart.int labelCount = input.int(50, \"Labels to show\", 1, 500)//@variable An array of `label` objects.var array<label> labelArray = array.new_label()//@variable A `chart.point` for the new label.labelPoint = chart.point.from_index(bar_index, close)//@variable The text in the new label.string labelText = na//@variable The color of the new label.color labelColor = na//@variable The style of the new label.string labelStyle = na// Set the label attributes for rising bars.if close > open    labelText  := \"Rising\"    labelColor := color.green    labelStyle := label.style_label_down// Set the label attributes for falling bars.else if close < open    labelText  := \"Falling\"    labelColor := color.red    labelStyle := label.style_label_up// Add a new label to the `labelArray` when the chart bar closed at a new value.if close != open    labelArray.push(label.new(labelPoint, labelText, color = labelColor, style = labelStyle))// Remove the first element and delete its label when the size of the `labelArray` exceeds the `labelCount`.if labelArray.size() > labelCount    label.delete(labelArray.shift())"
  },
  {
    "name": "array.new_line",
    "namespace": "array",
    "syntax": "array.new_line(size, initial_value) → array<line>",
    "description": "The function creates a new array object of line type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series line",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<line>",
    "example": "//@version=6indicator(\"array.new_line example\")// draw last 15 linesvar a = array.new_line()array.push(a, line.new(bar_index - 1, close[1], bar_index, close))if array.size(a) > 15    ln = array.shift(a)    line.delete(ln)"
  },
  {
    "name": "array.new_linefill",
    "namespace": "array",
    "syntax": "array.new_linefill(size, initial_value) → array<linefill>",
    "description": "The function creates a new array object of linefill type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series linefill",
        "description": "Initial value of all array elements.",
        "required": false
      }
    ],
    "returns": "array<linefill>",
    "example": ""
  },
  {
    "name": "array.new_string",
    "namespace": "array",
    "syntax": "array.new_string(size, initial_value) → array<string>",
    "description": "The function creates a new array object of string type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series string",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<string>",
    "example": "//@version=6indicator(\"array.new_string example\")length = 5a = array.new_string(length, \"text\")label.new(bar_index, close, array.get(a, 0))"
  },
  {
    "name": "array.new_table",
    "namespace": "array",
    "syntax": "array.new_table(size, initial_value) → array<table>",
    "description": "The function creates a new array object of table type elements.",
    "parameters": [
      {
        "name": "size",
        "type": "series int",
        "description": "Initial size of an array. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "series table",
        "description": "Initial value of all array elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "array<table>",
    "example": "//@version=6indicator(\"table array\")tables = array.new_table()array.push(tables, table.new(position = position.top_left, rows = 1, columns = 2, bgcolor = color.yellow, border_width=1))plot(1)"
  },
  {
    "name": "array.percentile_linear_interpolation",
    "namespace": "array",
    "syntax": "array.percentile_linear_interpolation(id, percentage) → series float",
    "description": "Returns the value for which the specified percentage of array values (percentile) are less than or equal to it, using linear interpolation.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "percentage",
        "type": "series int/float",
        "description": "The percentage of values that must be equal or less than the returned value.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "array.percentile_nearest_rank",
    "namespace": "array",
    "syntax": "array.percentile_nearest_rank(id, percentage) → series float",
    "description": "Returns the value for which the specified percentage of array values (percentile) are less than or equal to it, using the nearest-rank method.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "percentage",
        "type": "series int/float",
        "description": "The percentage of values that must be equal or less than the returned value.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "array.percentrank",
    "namespace": "array",
    "syntax": "array.percentrank(id, index) → series float",
    "description": "Returns the percentile rank of the element at the specified index.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The index of the element for which the percentile rank should be calculated.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "array.pop",
    "namespace": "array",
    "syntax": "array.pop(id) → series <type>",
    "description": "The function removes the last element from an array and returns its value.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.pop example\")a = array.new_float(5,high)removedEl = array.pop(a)plot(array.size(a))plot(removedEl)"
  },
  {
    "name": "array.push",
    "namespace": "array",
    "syntax": "array.push(id, value) → void",
    "description": "The function appends a value to an array.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value of the element added to the end of the array.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.push example\")a = array.new_float(5, 0)array.push(a, open)plot(array.get(a, 5))"
  },
  {
    "name": "array.range",
    "namespace": "array",
    "syntax": "array.range(id) → series float",
    "description": "The function returns the difference between the min and max values from a given array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"array.range example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.range(a))"
  },
  {
    "name": "array.remove",
    "namespace": "array",
    "syntax": "array.remove(id, index) → series <type>",
    "description": "The function changes the contents of an array by removing the element with the specified index.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The index of the element to remove.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.remove example\")a = array.new_float(5,high)removedEl = array.remove(a, 0)plot(array.size(a))plot(removedEl)"
  },
  {
    "name": "array.reverse",
    "namespace": "array",
    "syntax": "array.reverse(id) → void",
    "description": "The function reverses an array. The first array element becomes the last, and the last array element becomes the first.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.reverse example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.get(a, 0))array.reverse(a)plot(array.get(a, 0))"
  },
  {
    "name": "array.set",
    "namespace": "array",
    "syntax": "array.set(id, index, value) → void",
    "description": "The function sets the value of the element at the specified index.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The index of the element to be modified.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The new value to be set.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.set example\")a = array.new_float(10)for i = 0 to 9    array.set(a, i, close[i])plot(array.sum(a) / 10)"
  },
  {
    "name": "array.shift",
    "namespace": "array",
    "syntax": "array.shift(id) → series <type>",
    "description": "The function removes an array's first element and returns its value.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.shift example\")a = array.new_float(5,high)removedEl = array.shift(a)plot(array.size(a))plot(removedEl)"
  },
  {
    "name": "array.size",
    "namespace": "array",
    "syntax": "array.size(id) → series int",
    "description": "The function returns the number of elements in an array.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"array.size example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])// note that changes in slice also modify original arrayslice = array.slice(a, 0, 5)array.push(slice, open)// size was changed in slice and in original arrayplot(array.size(a))plot(array.size(slice))"
  },
  {
    "name": "array.slice",
    "namespace": "array",
    "syntax": "array.slice(id, index_from, index_to) → array<type>",
    "description": "The function creates a slice from an existing array. If an object from the slice changes, the changes are applied to both the new and the original arrays.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "index_from",
        "type": "series int",
        "description": "Zero-based index at which to begin extraction.",
        "required": false
      },
      {
        "name": "index_to",
        "type": "series int",
        "description": "Zero-based index before which to end extraction. The function extracts up to but not including the element with this index.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"array.slice example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])// take elements from 0 to 4// *note that changes in slice also modify original arrayslice = array.slice(a, 0, 5)plot(array.sum(a) / 10)plot(array.sum(slice) / 5)"
  },
  {
    "name": "array.some",
    "namespace": "array",
    "syntax": "array.some(id) → series bool",
    "description": "Returns true if at least one element of the id array is true, false otherwise.",
    "parameters": [
      {
        "name": "id",
        "type": "array<bool>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "array.sort",
    "namespace": "array",
    "syntax": "array.sort(id, order) → void",
    "description": "The function sorts the elements of an array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float/string>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "order",
        "type": "series sort_order",
        "description": "The sort order: order.ascending (default) or order.descending.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.sort example\")a = array.new_float(0,0)for i = 0 to 5    array.push(a, high[i])array.sort(a, order.descending)if barstate.islast    label.new(bar_index, close, str.tostring(a))"
  },
  {
    "name": "array.sort_indices",
    "namespace": "array",
    "syntax": "array.sort_indices(id, order) → array<int>",
    "description": "Returns an array of indices which, when used to index the original array, will access its elements in their sorted order. It does not modify the original array.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float/string>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "order",
        "type": "series sort_order",
        "description": "The sort order: order.ascending or order.descending. Optional. The default is order.ascending.",
        "required": false
      }
    ],
    "returns": "array<int>",
    "example": "//@version=6indicator(\"array.sort_indices\")a = array.from(5, -2, 0, 9, 1)sortedIndices = array.sort_indices(a) // [1, 2, 4, 0, 3]indexOfSmallestValue = array.get(sortedIndices, 0) // 1smallestValue = array.get(a, indexOfSmallestValue) // -2plot(smallestValue)"
  },
  {
    "name": "array.standardize",
    "namespace": "array",
    "syntax": "array.standardize(id) → array<float>",
    "description": "The function returns the array of standardized elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "array<float>",
    "example": "//@version=6indicator(\"array.standardize example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])b = array.standardize(a)plot(array.min(b))plot(array.max(b))"
  },
  {
    "name": "array.stdev",
    "namespace": "array",
    "syntax": "array.stdev(id, biased) → series float",
    "description": "The function returns the standard deviation of an array's elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "biased",
        "type": "series bool",
        "description": "Determines which estimate should be used. Optional. The default is true.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.stdev example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.stdev(a))"
  },
  {
    "name": "array.sum",
    "namespace": "array",
    "syntax": "array.sum(id) → series float",
    "description": "The function returns the sum of an array's elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.sum example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.sum(a))"
  },
  {
    "name": "array.unshift",
    "namespace": "array",
    "syntax": "array.unshift(id, value) → void",
    "description": "The function inserts the value at the beginning of the array.",
    "parameters": [
      {
        "name": "id",
        "type": "any array type",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the array's elements>",
        "description": "The value to add to the start of the array.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"array.unshift example\")a = array.new_float(5, 0)array.unshift(a, open)plot(array.get(a, 0))"
  },
  {
    "name": "array.variance",
    "namespace": "array",
    "syntax": "array.variance(id, biased) → series float",
    "description": "The function returns the variance of an array's elements.",
    "parameters": [
      {
        "name": "id",
        "type": "array<int/float>",
        "description": "An array object.",
        "required": false
      },
      {
        "name": "biased",
        "type": "series bool",
        "description": "Determines which estimate should be used. Optional. The default is true.",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "polymorphic": "element"
    },
    "example": "//@version=6indicator(\"array.variance example\")a = array.new_float(0)for i = 0 to 9    array.push(a, close[i])plot(array.variance(a))"
  },
  {
    "name": "barcolor",
    "syntax": "barcolor(color, offset, editable, show_last, title, display) → void",
    "description": "Set color of bars.",
    "parameters": [
      {
        "name": "color",
        "type": "series color",
        "description": "Color of bars. You can use constants like 'red' or '#ff001a' as well as complex expressions like 'close >= open ? color.green : color.red'. Required argument.",
        "required": true
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts the color series to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then barcolor style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the barcolor. Optional argument.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_simple_display",
        "description": "Controls where the barcolor is displayed. Possible values are: display.none, display.all. Default is display.all.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"barcolor example\", overlay=true)barcolor(close < open ? color.black : color.white)"
  },
  {
    "name": "bgcolor",
    "syntax": "bgcolor(color, offset, editable, show_last, title, display, force_overlay) → void",
    "description": "Fill background of bars with specified color.",
    "parameters": [
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the filled background. You can use constants like 'red' or '#ff001a' as well as complex expressions like 'close >= open ? color.green : color.red'. Required argument.",
        "required": true
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts the color series to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then bgcolor style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the bgcolor. Optional argument.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_simple_display",
        "description": "Controls where the bgcolor is displayed. Possible values are: display.none, display.all. Default is display.all.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"bgcolor example\", overlay=true)bgcolor(close < open ? color.new(color.red,70) : color.new(color.green, 70))"
  },
  {
    "name": "bool",
    "syntax": "bool(x) → const bool",
    "description": "Converts the x value to a bool value. Returns false if x is na, false, or an int/float value equal to 0. Returns true for all other possible values.",
    "parameters": [
      {
        "name": "x",
        "type": "simple int/float/bool",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "const bool",
    "example": ""
  },
  {
    "name": "box",
    "syntax": "box(x) → series box",
    "description": "Casts na to box.",
    "parameters": [
      {
        "name": "x",
        "type": "series box",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "series box",
    "example": ""
  },
  {
    "name": "box.copy",
    "namespace": "box",
    "syntax": "box.copy(id) → series box",
    "description": "Clones the box object.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "Box object.",
        "required": false
      }
    ],
    "returns": "series box",
    "example": "//@version=6indicator('Last 50 bars price ranges', overlay = true)LOOKBACK = 50highest = ta.highest(LOOKBACK)lowest = ta.lowest(LOOKBACK)if barstate.islastconfirmedhistory    var BoxLast = box.new(bar_index[LOOKBACK], highest, bar_index, lowest, bgcolor = color.new(color.green, 80))    var BoxPrev = box.copy(BoxLast)    box.set_lefttop(BoxPrev, bar_index[LOOKBACK * 2], highest[50])    box.set_rightbottom(BoxPrev, bar_index[LOOKBACK], lowest[50])    box.set_bgcolor(BoxPrev, color.new(color.red, 80))"
  },
  {
    "name": "box.delete",
    "namespace": "box",
    "syntax": "box.delete(id) → void",
    "description": "Deletes the specified box object. If it has already been deleted, does nothing.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object to delete.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.get_bottom",
    "namespace": "box",
    "syntax": "box.get_bottom(id) → series float",
    "description": "Returns the price value of the bottom border of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "box.get_left",
    "namespace": "box",
    "syntax": "box.get_left(id) → series int",
    "description": "Returns the bar index or the UNIX time (depending on the last value used for 'xloc') of the left border of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "box.get_right",
    "namespace": "box",
    "syntax": "box.get_right(id) → series int",
    "description": "Returns the bar index or the UNIX time (depending on the last value used for 'xloc') of the right border of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "box.get_top",
    "namespace": "box",
    "syntax": "box.get_top(id) → series float",
    "description": "Returns the price value of the top border of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "box.new",
    "namespace": "box",
    "syntax": "box.new(top_left, bottom_right, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting) → series box",
    "description": "Creates a new box object.",
    "parameters": [
      {
        "name": "top_left",
        "type": "chart.point",
        "description": "A chart.point object that specifies the top-left corner location of the box.",
        "required": false
      },
      {
        "name": "bottom_right",
        "type": "chart.point",
        "description": "A chart.point object that specifies the bottom-right corner location of the box.",
        "required": false
      },
      {
        "name": "border_color",
        "type": "series color",
        "description": "Color of the four borders. Optional. The default is color.blue.",
        "required": false
      },
      {
        "name": "border_width",
        "type": "series int",
        "description": "Width of the four borders, in pixels. Optional. The default is 1 pixel.",
        "required": false
      },
      {
        "name": "border_style",
        "type": "series string",
        "description": "Style of the four borders. Possible values: line.style_solid, line.style_dotted, line.style_dashed. Optional. The default value is line.style_solid.",
        "required": false
      },
      {
        "name": "extend",
        "type": "series string",
        "description": "When extend.none is used, the horizontal borders start at the left border and end at the right border. With extend.left or extend.right, the horizontal borders are extended indefinitely to the left or right of the box, respectively. With extend.both, the horizontal borders are extended on both sides. Optional. The default value is extend.none.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "Determines whether the arguments to 'left' and 'right' are a bar index or a time value. If xloc = xloc.bar_index, the arguments must be a bar index. If xloc = xloc.bar_time, the arguments must be a UNIX time. Possible values: xloc.bar_index and xloc.bar_time. Optional. The default is xloc.bar_index.",
        "required": false
      },
      {
        "name": "bgcolor",
        "type": "series color",
        "description": "Background color of the box. Optional. The default is color.blue.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "The text to be displayed inside the box. Optional. The default is empty string.",
        "required": false
      },
      {
        "name": "text_size",
        "type": "series int/string",
        "description": "Optional. Size of the box's text. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.auto or 0.",
        "required": false
      },
      {
        "name": "text_color",
        "type": "series color",
        "description": "The color of the text. Optional. The default is color.black.",
        "required": false
      },
      {
        "name": "text_halign",
        "type": "series string",
        "description": "The horizontal alignment of the box's text. Optional. The default value is text.align_center. Possible values: text.align_left, text.align_center, text.align_right.",
        "required": false
      },
      {
        "name": "text_valign",
        "type": "series string",
        "description": "The vertical alignment of the box's text. Optional. The default value is text.align_center. Possible values: text.align_top, text.align_center, text.align_bottom.",
        "required": false
      },
      {
        "name": "text_wrap",
        "type": "series string",
        "description": "Optional. Whether to wrap text. Wrapped text starts a new line when it reaches the side of the box. Wrapped text lower than the bottom of the box is not displayed. Unwrapped text stays on a single line and is displayed past the width of the box if it is too long. If the text_size is 0 or text.wrap_auto, this setting has no effect. The default value is text.wrap_none. Possible values: text.wrap_none, text.wrap_auto.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      },
      {
        "name": "left",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "top",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "right",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "bottom",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series box",
    "example": "//@version=6indicator(\"box.new\")var b = box.new(time, open, time + 60 * 60 * 24, close, xloc=xloc.bar_time, border_style=line.style_dashed)box.set_lefttop(b, time, 100)box.set_rightbottom(b, time + 60 * 60 * 24, 500)box.set_bgcolor(b, color.green)"
  },
  {
    "name": "box.set_bgcolor",
    "namespace": "box",
    "syntax": "box.set_bgcolor(id, color) → void",
    "description": "Sets the background color of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "New background color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_border_color",
    "namespace": "box",
    "syntax": "box.set_border_color(id, color) → void",
    "description": "Sets the border color of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "New border color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_border_style",
    "namespace": "box",
    "syntax": "box.set_border_style(id, style) → void",
    "description": "Sets the border style of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "style",
        "type": "series string",
        "description": "New border style.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_border_width",
    "namespace": "box",
    "syntax": "box.set_border_width(id, width) → void",
    "description": "Sets the border width of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "width",
        "type": "series int",
        "description": "Width of the four borders, in pixels.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_bottom",
    "namespace": "box",
    "syntax": "box.set_bottom(id, bottom) → void",
    "description": "Sets the bottom coordinate of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "bottom",
        "type": "series int/float",
        "description": "Price value of the bottom border.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_bottom_right_point",
    "namespace": "box",
    "syntax": "box.set_bottom_right_point(id, point) → void",
    "description": "Sets the bottom-right corner location of the id box to point.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_extend",
    "namespace": "box",
    "syntax": "box.set_extend(id, extend) → void",
    "description": "Sets extending type of the border of this box object. When extend.none is used, the horizontal borders start at the left border and end at the right border. With extend.left or extend.right, the horizontal borders are extended indefinitely to the left or right of the box, respectively. With extend.both, the horizontal borders are extended on both sides.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "extend",
        "type": "series string",
        "description": "New extending type.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_left",
    "namespace": "box",
    "syntax": "box.set_left(id, left) → void",
    "description": "Sets the left coordinate of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "left",
        "type": "series int",
        "description": "Bar index or bar time of the left border. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_lefttop",
    "namespace": "box",
    "syntax": "box.set_lefttop(id, left, top) → void",
    "description": "Sets the left and top coordinates of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "left",
        "type": "series int",
        "description": "Bar index or bar time of the left border.",
        "required": false
      },
      {
        "name": "top",
        "type": "series int/float",
        "description": "Price value of the top border.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_right",
    "namespace": "box",
    "syntax": "box.set_right(id, right) → void",
    "description": "Sets the right coordinate of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "right",
        "type": "series int",
        "description": "Bar index or bar time of the right border. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_rightbottom",
    "namespace": "box",
    "syntax": "box.set_rightbottom(id, right, bottom) → void",
    "description": "Sets the right and bottom coordinates of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "right",
        "type": "series int",
        "description": "Bar index or bar time of the right border.",
        "required": false
      },
      {
        "name": "bottom",
        "type": "series int/float",
        "description": "Price value of the bottom border.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text",
    "namespace": "box",
    "syntax": "box.set_text(id, text) → void",
    "description": "The function sets the text in the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "The text to be displayed inside the box.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_color",
    "namespace": "box",
    "syntax": "box.set_text_color(id, text_color) → void",
    "description": "The function sets the color of the text inside the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_color",
        "type": "series color",
        "description": "The color of the text.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_font_family",
    "namespace": "box",
    "syntax": "box.set_text_font_family(id, text_font_family) → void",
    "description": "The function sets the font family of the text inside the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"Example of setting the box font\")if barstate.islastconfirmedhistory    b = box.new(bar_index, open-ta.tr, bar_index-50, open-ta.tr*5, text=\"monospace\")    box.set_text_font_family(b, font.family_monospace)"
  },
  {
    "name": "box.set_text_formatting",
    "namespace": "box",
    "syntax": "box.set_text_formatting(id, text_formatting) → void",
    "description": "Sets the formatting attributes the drawing applies to displayed text.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_halign",
    "namespace": "box",
    "syntax": "box.set_text_halign(id, text_halign) → void",
    "description": "The function sets the horizontal alignment of the box's text.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_halign",
        "type": "series string",
        "description": "The horizontal alignment of a box's text. Possible values: text.align_left, text.align_center, text.align_right.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_size",
    "namespace": "box",
    "syntax": "box.set_text_size(id, text_size) → void",
    "description": "The function sets the size of the box's text.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_size",
        "type": "series int/string",
        "description": "Size of the box's text. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36).",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_valign",
    "namespace": "box",
    "syntax": "box.set_text_valign(id, text_valign) → void",
    "description": "The function sets the vertical alignment of a box's text.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_valign",
        "type": "series string",
        "description": "The vertical alignment of the box's text. Possible values: text.align_top, text.align_center, text.align_bottom.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_text_wrap",
    "namespace": "box",
    "syntax": "box.set_text_wrap(id, text_wrap) → void",
    "description": "The function sets the mode of wrapping of the text inside the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "text_wrap",
        "type": "series string",
        "description": "Whether to wrap text. Wrapped text starts a new line when it reaches the side of the box. Wrapped text lower than the bottom of the box is not displayed. Unwrapped text stays on a single line and is displayed past the width of the box if it is too long. If the text_size is 0 or text.wrap_auto, this setting has no effect. Possible values: text.wrap_none, text.wrap_auto.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_top",
    "namespace": "box",
    "syntax": "box.set_top(id, top) → void",
    "description": "Sets the top coordinate of the box.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "top",
        "type": "series int/float",
        "description": "Price value of the top border.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_top_left_point",
    "namespace": "box",
    "syntax": "box.set_top_left_point(id, point) → void",
    "description": "Sets the top-left corner location of the id box to point.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "A box object.",
        "required": false
      },
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "box.set_xloc",
    "namespace": "box",
    "syntax": "box.set_xloc(id, left, right, xloc) → void",
    "description": "Sets the left and right borders of a box and updates its xloc property.",
    "parameters": [
      {
        "name": "id",
        "type": "series box",
        "description": "The ID of the box object to update.",
        "required": false
      },
      {
        "name": "left",
        "type": "series int",
        "description": "The bar index or timestamp for the left border of the box.",
        "required": false
      },
      {
        "name": "right",
        "type": "series int",
        "description": "The bar index or timestamp for the right border of the box.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "Determines whether the box treats the left and right arguments as bar indices or timestamps. Possible values: xloc.bar_index and xloc.bar_time. If the value is xloc.bar_index, the arguments represent bar indices. If xloc.bar_time, the arguments represent UNIX timestamps.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "chart.point.copy",
    "namespace": "chart",
    "syntax": "chart.point.copy(id) → chart.point",
    "description": "Creates a copy of a chart.point object with the specified id.",
    "parameters": [
      {
        "name": "id",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "chart.point",
    "example": ""
  },
  {
    "name": "chart.point.from_index",
    "namespace": "chart",
    "syntax": "chart.point.from_index(index, price) → chart.point",
    "description": "Returns a chart.point object with index as its x-coordinate and price as its y-coordinate.",
    "parameters": [
      {
        "name": "index",
        "type": "series int",
        "description": "The x-coordinate of the point, expressed as a bar index value.",
        "required": false
      },
      {
        "name": "price",
        "type": "series int/float",
        "description": "The y-coordinate of the point.",
        "required": false
      }
    ],
    "returns": "chart.point",
    "example": ""
  },
  {
    "name": "chart.point.from_time",
    "namespace": "chart",
    "syntax": "chart.point.from_time(time, price) → chart.point",
    "description": "Returns a chart.point object with time as its x-coordinate and price as its y-coordinate.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "The x-coordinate of the point, expressed as a UNIX time value, in milliseconds.",
        "required": false
      },
      {
        "name": "price",
        "type": "series int/float",
        "description": "The y-coordinate of the point.",
        "required": false
      }
    ],
    "returns": "chart.point",
    "example": ""
  },
  {
    "name": "chart.point.new",
    "namespace": "chart",
    "syntax": "chart.point.new(time, index, price) → chart.point",
    "description": "Creates a new chart.point object with the specified time, index, and price.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "The x-coordinate of the point, expressed as a UNIX time value, in milliseconds.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "The x-coordinate of the point, expressed as a bar index value.",
        "required": false
      },
      {
        "name": "price",
        "type": "series int/float",
        "description": "The y-coordinate of the point.",
        "required": false
      }
    ],
    "returns": "chart.point",
    "example": ""
  },
  {
    "name": "chart.point.now",
    "namespace": "chart",
    "syntax": "chart.point.now(price) → chart.point",
    "description": "Returns a chart.point object with price as the y-coordinate",
    "parameters": [
      {
        "name": "price",
        "type": "series int/float",
        "description": "The y-coordinate of the point. Optional. The default is close.",
        "required": false
      }
    ],
    "returns": "chart.point",
    "example": ""
  },
  {
    "name": "color",
    "syntax": "color(x) → const color",
    "description": "Casts na to color",
    "parameters": [
      {
        "name": "x",
        "type": "const color",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "const color",
    "example": ""
  },
  {
    "name": "color.b",
    "namespace": "color",
    "syntax": "color.b(color) → const float",
    "description": "Retrieves the value of the color's blue component.",
    "parameters": [
      {
        "name": "color",
        "type": "const color",
        "description": "Color.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": "//@version=6indicator(\"color.b\", overlay=true)plot(color.b(color.blue))"
  },
  {
    "name": "color.from_gradient",
    "namespace": "color",
    "syntax": "color.from_gradient(value, bottom_value, top_value, bottom_color, top_color) → series color",
    "description": "Based on the relative position of value in the bottom_value to top_value range, the function returns a color from the gradient defined by bottom_color to top_color.",
    "parameters": [
      {
        "name": "value",
        "type": "series int/float",
        "description": "Value to calculate the position-dependent color.",
        "required": false
      },
      {
        "name": "bottom_value",
        "type": "series int/float",
        "description": "Bottom position value corresponding to bottom_color.",
        "required": false
      },
      {
        "name": "top_value",
        "type": "series int/float",
        "description": "Top position value corresponding to top_color.",
        "required": false
      },
      {
        "name": "bottom_color",
        "type": "series color",
        "description": "Bottom position color.",
        "required": false
      },
      {
        "name": "top_color",
        "type": "series color",
        "description": "Top position color.",
        "required": false
      }
    ],
    "returns": "series color",
    "example": "//@version=6indicator(\"color.from_gradient\", overlay=true)color1 = color.from_gradient(close, low, high, color.yellow, color.lime)color2 = color.from_gradient(ta.rsi(close, 7), 0, 100, color.rgb(255, 0, 0), color.rgb(0, 255, 0, 50))plot(close, color=color1)plot(ta.rsi(close,7), color=color2)"
  },
  {
    "name": "color.g",
    "namespace": "color",
    "syntax": "color.g(color) → const float",
    "description": "Retrieves the value of the color's green component.",
    "parameters": [
      {
        "name": "color",
        "type": "const color",
        "description": "Color.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": "//@version=6indicator(\"color.g\", overlay=true)plot(color.g(color.green))"
  },
  {
    "name": "color.new",
    "namespace": "color",
    "syntax": "color.new(color, transp) → const color",
    "description": "Function color applies the specified transparency to the given color.",
    "parameters": [
      {
        "name": "color",
        "type": "const color",
        "description": "Color to apply transparency to.",
        "required": false
      },
      {
        "name": "transp",
        "type": "const int/float",
        "description": "Possible values are from 0 (not transparent) to 100 (invisible).",
        "required": false
      }
    ],
    "returns": "const color",
    "example": "//@version=6indicator(\"color.new\", overlay=true)plot(close, color=color.new(color.red, 50))"
  },
  {
    "name": "color.r",
    "namespace": "color",
    "syntax": "color.r(color) → const float",
    "description": "Retrieves the value of the color's red component.",
    "parameters": [
      {
        "name": "color",
        "type": "const color",
        "description": "Color.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": "//@version=6indicator(\"color.r\", overlay=true)plot(color.r(color.red))"
  },
  {
    "name": "color.rgb",
    "namespace": "color",
    "syntax": "color.rgb(red, green, blue, transp) → const color",
    "description": "Creates a new color with transparency using the RGB color model.",
    "parameters": [
      {
        "name": "red",
        "type": "const int/float",
        "description": "Red color component. Possible values are from 0 to 255.",
        "required": false
      },
      {
        "name": "green",
        "type": "const int/float",
        "description": "Green color component. Possible values are from 0 to 255.",
        "required": false
      },
      {
        "name": "blue",
        "type": "const int/float",
        "description": "Blue color component. Possible values are from 0 to 255.",
        "required": false
      },
      {
        "name": "transp",
        "type": "const int/float",
        "description": "Optional. Color transparency. Possible values are from 0 (opaque) to 100 (invisible). Default value is 0.",
        "required": false
      }
    ],
    "returns": "const color",
    "example": "//@version=6indicator(\"color.rgb\", overlay=true)plot(close, color=color.rgb(255, 0, 0, 50))"
  },
  {
    "name": "color.t",
    "namespace": "color",
    "syntax": "color.t(color) → const float",
    "description": "Retrieves the color's transparency.",
    "parameters": [
      {
        "name": "color",
        "type": "const color",
        "description": "Color.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": "//@version=6indicator(\"color.t\", overlay=true)plot(color.t(color.new(color.red, 50)))"
  },
  {
    "name": "dayofmonth",
    "syntax": "dayofmonth(time, timezone) → series int",
    "description": "Calculates the day number of the month, in a specified time zone, from a UNIX timestamp.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "A UNIX timestamp in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Optional. Specifies the time zone of the returned day number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "dayofweek",
    "syntax": "dayofweek(time, timezone) → series int",
    "description": "Calculates the day number of the week, in a specified time zone, from a UNIX timestamp.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "A UNIX timestamp in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Optional. Specifies the time zone of the returned day number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "fill",
    "syntax": "fill(hline1, hline2, color, title, editable, fillgaps, display) → void",
    "description": "Fills background between two plots or hlines with a given color.",
    "parameters": [
      {
        "name": "hline1",
        "type": "hline",
        "description": "The first hline object. Required argument.",
        "required": true
      },
      {
        "name": "hline2",
        "type": "hline",
        "description": "The second hline object. Required argument.",
        "required": true
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the background fill. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the created fill object. Optional argument.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then fill style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "fillgaps",
        "type": "const bool",
        "description": "Controls continuing fills on gaps, i.e., when one of the plot() calls returns an na value. When true, the last fill will continue on gaps. The default is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_simple_display",
        "description": "Controls where the fill is displayed. Possible values are: display.none, display.all. Default is display.all.",
        "required": false
      },
      {
        "name": "plot1",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "plot2",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "show_last",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "top_value",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "bottom_value",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "top_color",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "bottom_color",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"Fill between hlines\", overlay = false)h1 = hline(20)h2 = hline(10)fill(h1, h2, color = color.new(color.blue, 90))"
  },
  {
    "name": "fixnan",
    "syntax": "fixnan(source) → series color",
    "description": "For a given series replaces NaN values with previous nearest non-NaN value.",
    "parameters": [
      {
        "name": "source",
        "type": "series color",
        "description": "Source used for the calculation.",
        "required": false
      }
    ],
    "returns": "series color",
    "flags": {
      "polymorphic": "input"
    },
    "example": ""
  },
  {
    "name": "float",
    "syntax": "float(x) → const float",
    "description": "Casts na to float",
    "parameters": [
      {
        "name": "x",
        "type": "const int/float",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "hline",
    "syntax": "hline(price, title, color, linestyle, linewidth, editable, display) → hline",
    "description": "Renders a horizontal line at a given fixed price level.",
    "parameters": [
      {
        "name": "price",
        "type": "input int/float",
        "description": "Price value at which the object will be rendered. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the object.",
        "required": false
      },
      {
        "name": "color",
        "type": "input color",
        "description": "Color of the rendered line. Must be a constant value (not an expression). Optional argument.",
        "required": false
      },
      {
        "name": "linestyle",
        "type": "input hline_style",
        "description": "Style of the rendered line. Possible values are: hline.style_solid, hline.style_dotted, hline.style_dashed. Optional argument.",
        "required": false
      },
      {
        "name": "linewidth",
        "type": "input int",
        "description": "Width of the rendered line. Default value is 1.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then hline style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_simple_display",
        "description": "Controls where the hline is displayed. Possible values are: display.none, display.all. Default is display.all.",
        "required": false
      }
    ],
    "returns": "hline",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"input.hline\", overlay=true)hline(3.14, title='Pi', color=color.blue, linestyle=hline.style_dotted, linewidth=2)// You may fill the background between any two hlines with a fill() function:h1 = hline(20)h2 = hline(10)fill(h1, h2, color=color.new(color.green, 90))"
  },
  {
    "name": "hour",
    "syntax": "hour(time, timezone) → series int",
    "description": "",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "indicator",
    "syntax": "indicator(title, shorttitle, overlay, format, precision, scale, max_bars_back, timeframe, timeframe_gaps, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, max_polylines_count, dynamic_requests, behind_chart) → void",
    "description": "This declaration statement designates the script as an indicator and sets a number of indicator-related properties.",
    "parameters": [
      {
        "name": "title",
        "type": "const string",
        "description": "The title of the script. It is displayed on the chart when no shorttitle argument is used, and becomes the publication's default title when publishing the script.",
        "required": false
      },
      {
        "name": "shorttitle",
        "type": "const string",
        "description": "The script's display name on charts. If specified, it will replace the title argument in most chart-related windows. Optional. The default is the argument used for title.",
        "required": false
      },
      {
        "name": "overlay",
        "type": "const bool",
        "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
        "required": false
      },
      {
        "name": "format",
        "type": "const string",
        "description": "Specifies the formatting of the script's displayed values. Possible values: format.inherit, format.price, format.volume, format.percent. Optional. The default is format.inherit.",
        "required": false
      },
      {
        "name": "precision",
        "type": "const int",
        "description": "Specifies the number of digits after the floating point of the script's displayed values. Must be a non-negative integer no greater than 16. If format is set to format.inherit and precision is specified, the format will instead be set to format.price. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is inherited from the precision of the chart's symbol.",
        "required": false
      },
      {
        "name": "scale",
        "type": "const scale_type",
        "description": "The price scale used. Possible values: scale.right, scale.left, scale.none. The scale.none value can only be applied in combination with overlay = true. Optional. By default, the script uses the same scale as the chart.",
        "required": false
      },
      {
        "name": "max_bars_back",
        "type": "const int",
        "description": "The length of the historical buffer the script keeps for every variable and function, which determines how many past values can be referenced using the [] history-referencing operator. The required buffer size is automatically detected by the Pine Script® runtime. Using this parameter is only necessary when a runtime error occurs because automatic detection fails. More information on the underlying mechanics of the historical buffer can be found in our Help Center. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "timeframe",
        "type": "const string",
        "description": "Adds multi-timeframe functionality to simple scripts. When specified, a \"Timeframe\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. The field's default value will be the argument supplied, whose format must conform to timeframe string specifications. To specify the chart's timeframe, use an empty string or the timeframe.period variable. The parameter cannot be used with scripts using Pine Script® drawings. Optional. The default is timeframe.period.",
        "required": false
      },
      {
        "name": "timeframe_gaps",
        "type": "const bool",
        "description": "Specifies how the indicator's values are displayed on chart bars when the timeframe is higher than the chart's. If true, a value only appears on a chart bar when the higher timeframe value becomes available, otherwise na is returned (thus a \"gap\" occurs). With false, what would otherwise be gaps are filled with the latest known value returned, avoiding na values. When specified, a \"Wait for timeframe closes\" checkbox will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is true.",
        "required": false
      },
      {
        "name": "explicit_plot_zorder",
        "type": "const bool",
        "description": "Specifies the order in which the script's plots, fills, and hlines are rendered. If true, plots are drawn in the order in which they appear in the script's code, each newer plot being drawn above the previous ones. This only applies to plot*() functions, fill(), and hline(). Optional. The default is false.",
        "required": false
      },
      {
        "name": "max_lines_count",
        "type": "const int",
        "description": "The number of last line drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "max_labels_count",
        "type": "const int",
        "description": "The number of last label drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "max_boxes_count",
        "type": "const int",
        "description": "The number of last box drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "calc_bars_count",
        "type": "const int",
        "description": "Limits the initial calculation of a script to the last number of bars specified. When specified, a \"Calculated bars\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is 0, in which case the script executes on all available bars.",
        "required": false
      },
      {
        "name": "max_polylines_count",
        "type": "const int",
        "description": "The number of last polyline drawings displayed. Possible values: 1-100. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "dynamic_requests",
        "type": "const bool",
        "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
        "required": false
      },
      {
        "name": "behind_chart",
        "type": "const bool",
        "description": "Optional. Controls whether all plots and drawings appear behind the chart display (if true) or in front of it (if false). This parameter only takes effect when the overlay parameter is true. The default is true.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"My script\", shorttitle=\"Script\")plot(close)"
  },
  {
    "name": "input",
    "syntax": "input(defval, title, tooltip, inline, group, display, active) → input color",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function automatically detects the type of the argument used for 'defval' and uses the corresponding input widget.",
    "parameters": [
      {
        "name": "defval",
        "type": "const int/float/bool/string/color or source-type built-ins",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. Source-type built-ins are built-in series float variables that specify the source of the calculation: close, hlc3, etc.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default depends on the type of the value passed to defval: display.none for bool and color values, display.all for everything else.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input color",
    "example": "//@version=6indicator(\"input\", overlay=true)i_switch = input(true, \"On/Off\")plot(i_switch ? open : na)i_len = input(7, \"Length\")i_src = input(close, \"Source\")plot(ta.sma(i_src, i_len))i_border = input(142.50, \"Price Border\")hline(i_border)bgcolor(close > i_border ? color.green : color.red)i_col = input(color.red, \"Plot Color\")plot(close, color=i_col)i_text = input(\"Hello!\", \"Message\")l = label.new(bar_index, high, text=i_text)label.delete(l[1])"
  },
  {
    "name": "input.bool",
    "namespace": "input",
    "syntax": "input.bool(defval, title, tooltip, inline, group, confirm, display, active) → input bool",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a checkmark to the script's inputs.",
    "parameters": [
      {
        "name": "defval",
        "type": "const bool",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input bool",
    "example": "//@version=6indicator(\"input.bool\", overlay=true)i_switch = input.bool(true, \"On/Off\")plot(i_switch ? open : na)"
  },
  {
    "name": "input.color",
    "namespace": "input",
    "syntax": "input.color(defval, title, tooltip, inline, group, confirm, display, active) → input color",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a color picker that allows the user to select a color and transparency, either from a palette or a hex value.",
    "parameters": [
      {
        "name": "defval",
        "type": "const color",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input color",
    "example": "//@version=6indicator(\"input.color\", overlay=true)i_col = input.color(color.red, \"Plot Color\")plot(close, color=i_col)"
  },
  {
    "name": "input.enum",
    "namespace": "input",
    "syntax": "input.enum(defval, title, options, tooltip, inline, group, confirm, display, active) → input enum",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown with options based on the enum fields passed to its defval and options parameters.",
    "parameters": [
      {
        "name": "defval",
        "type": "const enum",
        "description": "Determines the default value of the input, which users can change in the script's \"Settings/Inputs\" tab. When the options parameter has a specified tuple of enum fields, the tuple must include the defval.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of enum fields: [enumName.field1, enumName.field2, ...]",
        "description": "A list of options to choose from. Optional. By default, the titles of all of the enum's fields are available in the dropdown. Passing a tuple as the options argument limits the list to only the included fields.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input enum",
    "example": "//@version=6indicator(\"Session highlight\", overlay = true)//@enum        Contains fields with popular timezones as titles.//@field exch  Has an empty string as the title to represent the chart timezone.enum tz    utc  = \"UTC\"    exch = \"\"    ny   = \"America/New_York\"    chi  = \"America/Chicago\"    lon  = \"Europe/London\"    tok  = \"Asia/Tokyo\"//@variable The session string.selectedSession = input.session(\"1200-1500\", \"Session\")//@variable The selected timezone. The input's dropdown contains the fields in the `tz` enum.selectedTimezone = input.enum(tz.utc, \"Session Timezone\")//@variable Is `true` if the current bar's time is in the specified session.bool inSession = falseif not na(time(\"\", selectedSession, str.tostring(selectedTimezone)))    inSession := true// Highlight the background when `inSession` is `true`.bgcolor(inSession ? color.new(color.green, 90) : na, title = \"Active session highlight\")"
  },
  {
    "name": "input.float",
    "namespace": "input",
    "syntax": "input.float(defval, title, options, tooltip, inline, group, confirm, display, active) → input float",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a float input to the script's inputs.",
    "parameters": [
      {
        "name": "defval",
        "type": "const int/float",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. When a list of values is used with the options parameter, the value must be one of them.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of const int/float values: [val1, val2, ...]",
        "description": "A list of options to choose from a dropdown menu, separated by commas and enclosed in square brackets: [val1, val2, ...]. When using this parameter, the minval, maxval and step parameters cannot be used.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      },
      {
        "name": "minval",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "maxval",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "step",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "input float",
    "example": "//@version=6indicator(\"input.float\", overlay=true)i_angle1 = input.float(0.5, \"Sin Angle\", minval=-3.14, maxval=3.14, step=0.02)plot(math.sin(i_angle1) > 0 ? close : open, \"sin\", color=color.green)i_angle2 = input.float(0, \"Cos Angle\", options=[-3.14, -1.57, 0, 1.57, 3.14])plot(math.cos(i_angle2) > 0 ? close : open, \"cos\", color=color.red)"
  },
  {
    "name": "input.int",
    "namespace": "input",
    "syntax": "input.int(defval, title, options, tooltip, inline, group, confirm, display, active) → input int",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for an integer input to the script's inputs.",
    "parameters": [
      {
        "name": "defval",
        "type": "const int",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. When a list of values is used with the options parameter, the value must be one of them.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of const int values: [val1, val2, ...]",
        "description": "A list of options to choose from a dropdown menu, separated by commas and enclosed in square brackets: [val1, val2, ...]. When using this parameter, the minval, maxval and step parameters cannot be used.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      },
      {
        "name": "minval",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "maxval",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "step",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "input int",
    "example": "//@version=6indicator(\"input.int\", overlay=true)i_len1 = input.int(10, \"Length 1\", minval=5, maxval=21, step=1)plot(ta.sma(close, i_len1))i_len2 = input.int(10, \"Length 2\", options=[5, 10, 21])plot(ta.sma(close, i_len2))"
  },
  {
    "name": "input.price",
    "namespace": "input",
    "syntax": "input.price(defval, title, tooltip, inline, group, confirm, display, active) → input float",
    "description": "Adds a price input to the script's \"Settings/Inputs\" tab. The user can change the price in the settings or by selecting the indicator and dragging the price line.",
    "parameters": [
      {
        "name": "defval",
        "type": "const int/float",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "Optional. If true, the script prompts the user to set the input's initial value by clicking a point on the chart. If inputs of other types require confirmation, the \"Confirm inputs\" dialog box also displays this input's field, allowing final adjustments to the value before the script starts to run. The default is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input float",
    "example": "//@version=6indicator(\"input.price\", overlay=true)price1 = input.price(title=\"Date\", defval=42)plot(price1)price2 = input.price(54, title=\"Date\")plot(price2)"
  },
  {
    "name": "input.session",
    "namespace": "input",
    "syntax": "input.session(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds two dropdowns that allow the user to specify the beginning and the end of a session using the session selector and returns the result as a string.",
    "parameters": [
      {
        "name": "defval",
        "type": "const string",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of const string values: [val1, val2, ...]",
        "description": "A list of options to choose from.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input string",
    "example": "//@version=6indicator(\"input.session\", overlay=true)i_sess = input.session(\"1300-1700\", \"Session\", options=[\"0930-1600\", \"1300-1700\", \"1700-2100\"])t = time(timeframe.period, i_sess)bgcolor(time == t ? color.green : na)"
  },
  {
    "name": "input.source",
    "namespace": "input",
    "syntax": "input.source(defval, title, tooltip, inline, group, display, active, confirm) → series float",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown that allows the user to select a source for the calculation, e.g. close, hl2, etc. The user can also select an output from another indicator on their chart as the source.",
    "parameters": [
      {
        "name": "defval",
        "type": "open/high/low/close/hl2/hlc3/ohlc4/hlcc4",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"input.source\", overlay=true)i_src = input.source(close, \"Source\")plot(i_src)"
  },
  {
    "name": "input.string",
    "namespace": "input",
    "syntax": "input.string(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a string input to the script's inputs.",
    "parameters": [
      {
        "name": "defval",
        "type": "const string",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of const string values: [val1, val2, ...]",
        "description": "A list of options to choose from.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input string",
    "example": "//@version=6indicator(\"input.string\", overlay=true)i_text = input.string(\"Hello!\", \"Message\")l = label.new(bar_index, high, i_text)label.delete(l[1])"
  },
  {
    "name": "input.symbol",
    "namespace": "input",
    "syntax": "input.symbol(defval, title, tooltip, inline, group, confirm, display, active) → input string",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field that allows the user to select a specific symbol using the symbol search and returns that symbol, paired with its exchange prefix, as a string.",
    "parameters": [
      {
        "name": "defval",
        "type": "const string",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input string",
    "example": "//@version=6indicator(\"input.symbol\", overlay=true)i_sym = input.symbol(\"DELL\", \"Symbol\")s = request.security(i_sym, 'D', close)plot(s)"
  },
  {
    "name": "input.text_area",
    "namespace": "input",
    "syntax": "input.text_area(defval, title, tooltip, group, confirm, display, active) → input string",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a multiline text input.",
    "parameters": [
      {
        "name": "defval",
        "type": "const string",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input string",
    "example": "//@version=6indicator(\"input.text_area\")i_text = input.text_area(defval = \"Hello \\nWorld!\", title = \"Message\")plot(close)"
  },
  {
    "name": "input.time",
    "namespace": "input",
    "syntax": "input.time(defval, title, tooltip, inline, group, confirm, display, active) → input int",
    "description": "Adds two inputs to the script's \"Settings/Inputs\" tab on the same line: one for the date and one for the time. The user can change the price in the settings or by selecting the indicator and dragging the price line. The function returns a date/time value in UNIX format.",
    "parameters": [
      {
        "name": "defval",
        "type": "const int",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. The value can be a timestamp() function, but only if it uses a date argument in const string format.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "Optional. If true, the script prompts the user to set the input's initial value by clicking a point on the chart. If inputs of other types require confirmation, the \"Confirm inputs\" dialog box also displays this input's field, allowing final adjustments to the value before the script starts to run. The default is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input int",
    "example": "//@version=6indicator(\"input.time\", overlay=true)i_date = input.time(timestamp(\"20 Jul 2021 00:00 +0300\"), \"Date\")l = label.new(i_date, high, \"Date\", xloc=xloc.bar_time)label.delete(l[1])"
  },
  {
    "name": "input.timeframe",
    "namespace": "input",
    "syntax": "input.timeframe(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    "description": "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown that allows the user to select a specific timeframe via the timeframe selector and returns it as a string. The selector includes the custom timeframes a user may have added using the chart's Timeframe dropdown.",
    "parameters": [
      {
        "name": "defval",
        "type": "const string",
        "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
        "required": false
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
        "required": false
      },
      {
        "name": "options",
        "type": "tuple of const string values: [val1, val2, ...]",
        "description": "A list of options to choose from.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "const string",
        "description": "The string that will be shown to the user when hovering over the tooltip icon.",
        "required": false
      },
      {
        "name": "inline",
        "type": "const string",
        "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
        "required": false
      },
      {
        "name": "group",
        "type": "const string",
        "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
        "required": false
      },
      {
        "name": "confirm",
        "type": "const bool",
        "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
        "required": false
      },
      {
        "name": "display",
        "type": "const plot_display",
        "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "active",
        "type": "input bool",
        "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
        "required": false
      }
    ],
    "returns": "input string",
    "example": "//@version=6indicator(\"input.timeframe\", overlay=true)i_res = input.timeframe('D', \"Resolution\", options=['D', 'W', 'M'])s = request.security(\"AAPL\", i_res, close)plot(s)"
  },
  {
    "name": "int",
    "syntax": "int(x) → const int",
    "description": "Casts na or truncates float value to int",
    "parameters": [
      {
        "name": "x",
        "type": "const int/float",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "const int",
    "example": ""
  },
  {
    "name": "label",
    "syntax": "label(x) → series label",
    "description": "Casts na to label",
    "parameters": [
      {
        "name": "x",
        "type": "series label",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "series label",
    "example": ""
  },
  {
    "name": "label.copy",
    "namespace": "label",
    "syntax": "label.copy(id) → series label",
    "description": "Clones the label object.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      }
    ],
    "returns": "series label",
    "example": "//@version=6indicator('Last 100 bars highest/lowest', overlay = true)LOOKBACK = 100highest = ta.highest(LOOKBACK)highestBars = ta.highestbars(LOOKBACK)lowest = ta.lowest(LOOKBACK)lowestBars = ta.lowestbars(LOOKBACK)if barstate.islastconfirmedhistory    var labelHigh = label.new(bar_index + highestBars, highest, str.tostring(highest), color = color.green)    var labelLow = label.copy(labelHigh)    label.set_xy(labelLow, bar_index + lowestBars, lowest)    label.set_text(labelLow, str.tostring(lowest))    label.set_color(labelLow, color.red)    label.set_style(labelLow, label.style_label_up)"
  },
  {
    "name": "label.delete",
    "namespace": "label",
    "syntax": "label.delete(id) → void",
    "description": "Deletes the specified label object. If it has already been deleted, does nothing.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object to delete.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.get_text",
    "namespace": "label",
    "syntax": "label.get_text(id) → series string",
    "description": "Returns the text of this label object.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6indicator(\"label.get_text\")my_label = label.new(time, open, text=\"Open bar text\", xloc=xloc.bar_time)a = label.get_text(my_label)label.new(time, close, text = a + \" new\", xloc=xloc.bar_time)"
  },
  {
    "name": "label.get_x",
    "namespace": "label",
    "syntax": "label.get_x(id) → series int",
    "description": "Returns UNIX time or bar index (depending on the last xloc value set) of this label's position.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"label.get_x\")my_label = label.new(time, open, text=\"Open bar text\", xloc=xloc.bar_time)a = label.get_x(my_label)plot(time - label.get_x(my_label)) //draws zero plot"
  },
  {
    "name": "label.get_y",
    "namespace": "label",
    "syntax": "label.get_y(id) → series float",
    "description": "Returns price of this label's position.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "label.new",
    "namespace": "label",
    "syntax": "label.new(point, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting) → series label",
    "description": "Creates new label object.",
    "parameters": [
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object that specifies the label's location.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "Label text. Default is empty string.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "See description of x argument. Possible values: xloc.bar_index and xloc.bar_time. Default is xloc.bar_index.",
        "required": false
      },
      {
        "name": "yloc",
        "type": "series string",
        "description": "Possible values are yloc.price, yloc.abovebar, yloc.belowbar. If yloc=yloc.price, y argument specifies the price of the label position. If yloc=yloc.abovebar, label is located above bar. If yloc=yloc.belowbar, label is located below bar. Default is yloc.price.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the label border and arrow",
        "required": false
      },
      {
        "name": "style",
        "type": "series string",
        "description": "Label style. Possible values: label.style_none, label.style_xcross, label.style_cross, label.style_triangleup, label.style_triangledown, label.style_flag, label.style_circle, label.style_arrowup, label.style_arrowdown, label.style_label_up, label.style_label_down, label.style_label_left, label.style_label_right, label.style_label_lower_left, label.style_label_lower_right, label.style_label_upper_left, label.style_label_upper_right, label.style_label_center, label.style_square, label.style_diamond, label.style_text_outline. Default is label.style_label_down.",
        "required": false
      },
      {
        "name": "textcolor",
        "type": "series color",
        "description": "Text color.",
        "required": false
      },
      {
        "name": "size",
        "type": "series int/string",
        "description": "Optional. Size of the label. Accepts a positive int value or one of the built-in size.* constants. The constants and their equivalent numeric sizes are: size.auto (0), size.tiny (~7), size.small (~10), size.normal (12), size.large (18), size.huge (24). The default value is size.normal, which represents the numeric size of 12.",
        "required": false
      },
      {
        "name": "textalign",
        "type": "series string",
        "description": "Label text alignment. Possible values: text.align_left, text.align_center, text.align_right. Default value is text.align_center.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "series string",
        "description": "Hover to see tooltip label.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      },
      {
        "name": "x",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "y",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series label",
    "example": "//@version=6indicator(\"label.new\")var label1 = label.new(bar_index, low, text=\"Hello, world!\", style=label.style_circle)label.set_x(label1, 0)label.set_xloc(label1, time, xloc.bar_time)label.set_color(label1, color.red)label.set_size(label1, size.large)"
  },
  {
    "name": "label.set_color",
    "namespace": "label",
    "syntax": "label.set_color(id, color) → void",
    "description": "Sets label border and arrow color.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "New label border and arrow color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_point",
    "namespace": "label",
    "syntax": "label.set_point(id, point) → void",
    "description": "Sets the location of the id label to point.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "A label object.",
        "required": false
      },
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_size",
    "namespace": "label",
    "syntax": "label.set_size(id, size) → void",
    "description": "Sets arrow and text size of the specified label object.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "size",
        "type": "series int/string",
        "description": "Size of the label. Accepts a positive int value or one of the built-in size.* constants. The constants and their equivalent numeric sizes are: size.auto (0), size.tiny (~7), size.small (~10), size.normal (12), size.large (18), size.huge (24). The default value is size.normal, which represents the numeric size of 12.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_style",
    "namespace": "label",
    "syntax": "label.set_style(id, style) → void",
    "description": "Sets label style.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "style",
        "type": "series string",
        "description": "New label style. Possible values: label.style_none, label.style_xcross, label.style_cross, label.style_triangleup, label.style_triangledown, label.style_flag, label.style_circle, label.style_arrowup, label.style_arrowdown, label.style_label_up, label.style_label_down, label.style_label_left, label.style_label_right, label.style_label_lower_left, label.style_label_lower_right, label.style_label_upper_left, label.style_label_upper_right, label.style_label_center, label.style_square, label.style_diamond, label.style_text_outline.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_text",
    "namespace": "label",
    "syntax": "label.set_text(id, text) → void",
    "description": "Sets label text",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "New label text.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_text_font_family",
    "namespace": "label",
    "syntax": "label.set_text_font_family(id, text_font_family) → void",
    "description": "The function sets the font family of the text inside the label.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "A label object.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"Example of setting the label font\")if barstate.islastconfirmedhistory    l = label.new(bar_index, 0, \"monospace\", yloc=yloc.abovebar)    label.set_text_font_family(l, font.family_monospace)"
  },
  {
    "name": "label.set_text_formatting",
    "namespace": "label",
    "syntax": "label.set_text_formatting(id, text_formatting) → void",
    "description": "Sets the formatting attributes the drawing applies to displayed text.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_textalign",
    "namespace": "label",
    "syntax": "label.set_textalign(id, textalign) → void",
    "description": "Sets the alignment for the label text.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "textalign",
        "type": "series string",
        "description": "Label text alignment. Possible values: text.align_left, text.align_center, text.align_right.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_textcolor",
    "namespace": "label",
    "syntax": "label.set_textcolor(id, textcolor) → void",
    "description": "Sets color of the label text.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "textcolor",
        "type": "series color",
        "description": "New text color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_tooltip",
    "namespace": "label",
    "syntax": "label.set_tooltip(id, tooltip) → void",
    "description": "Sets the tooltip text.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "series string",
        "description": "Tooltip text.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_x",
    "namespace": "label",
    "syntax": "label.set_x(id, x) → void",
    "description": "Sets bar index or bar time (depending on the xloc) of the label position.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "New bar index or bar time of the label position. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_xloc",
    "namespace": "label",
    "syntax": "label.set_xloc(id, x, xloc) → void",
    "description": "Sets x-location and new bar index/time value.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "New bar index or bar time of the label position.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "New x-location value.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_xy",
    "namespace": "label",
    "syntax": "label.set_xy(id, x, y) → void",
    "description": "Sets bar index/time and price of the label position.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "New bar index or bar time of the label position. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "New price of the label position.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_y",
    "namespace": "label",
    "syntax": "label.set_y(id, y) → void",
    "description": "Sets price of the label position",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "New price of the label position.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "label.set_yloc",
    "namespace": "label",
    "syntax": "label.set_yloc(id, yloc) → void",
    "description": "Sets new y-location calculation algorithm.",
    "parameters": [
      {
        "name": "id",
        "type": "series label",
        "description": "Label object.",
        "required": false
      },
      {
        "name": "yloc",
        "type": "series string",
        "description": "New y-location value.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "library",
    "syntax": "library(title, overlay, dynamic_requests) → void",
    "description": "Declaration statement identifying a script as a library.",
    "parameters": [
      {
        "name": "title",
        "type": "const string",
        "description": "The title of the library and its identifier. It cannot contain spaces, special characters or begin with a digit. It is used as the publication's default title, and to uniquely identify the library in the import statement, when another script uses it. It is also used as the script's name on the chart.",
        "required": false
      },
      {
        "name": "overlay",
        "type": "const bool",
        "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
        "required": false
      },
      {
        "name": "dynamic_requests",
        "type": "const bool",
        "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6// @description Math librarylibrary(\"num_methods\", overlay = true)// Calculate \"sinh()\" from the float parameter `x`export sinh(float x) =>    (math.exp(x) - math.exp(-x)) / 2.0plot(sinh(0))"
  },
  {
    "name": "line",
    "syntax": "line(x) → series line",
    "description": "Casts na to line",
    "parameters": [
      {
        "name": "x",
        "type": "series line",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "series line",
    "example": ""
  },
  {
    "name": "line.copy",
    "namespace": "line",
    "syntax": "line.copy(id) → series line",
    "description": "Clones the line object.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      }
    ],
    "returns": "series line",
    "example": "//@version=6indicator('Last 100 bars price range', overlay = true)LOOKBACK = 100highest = ta.highest(LOOKBACK)lowest = ta.lowest(LOOKBACK)if barstate.islastconfirmedhistory    var lineTop = line.new(bar_index[LOOKBACK], highest, bar_index, highest, color = color.green)    var lineBottom = line.copy(lineTop)    line.set_y1(lineBottom, lowest)    line.set_y2(lineBottom, lowest)    line.set_color(lineBottom, color.red)"
  },
  {
    "name": "line.delete",
    "namespace": "line",
    "syntax": "line.delete(id) → void",
    "description": "Deletes the specified line object. If it has already been deleted, does nothing.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object to delete.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.get_price",
    "namespace": "line",
    "syntax": "line.get_price(id, x) → series float",
    "description": "Returns the price level of a line at a given bar index.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "Bar index for which price is required.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"GetPrice\", overlay=true)var line l = naif bar_index == 10    l := line.new(0, high[5], bar_index, high)plot(line.get_price(l, bar_index), color=color.green)"
  },
  {
    "name": "line.get_x1",
    "namespace": "line",
    "syntax": "line.get_x1(id) → series int",
    "description": "Returns UNIX time or bar index (depending on the last xloc value set) of the first point of the line.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"line.get_x1\")my_line = line.new(time, open, time + 60 * 60 * 24, close, xloc=xloc.bar_time)a = line.get_x1(my_line)plot(time - line.get_x1(my_line)) //draws zero plot"
  },
  {
    "name": "line.get_x2",
    "namespace": "line",
    "syntax": "line.get_x2(id) → series int",
    "description": "Returns UNIX time or bar index (depending on the last xloc value set) of the second point of the line.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "line.get_y1",
    "namespace": "line",
    "syntax": "line.get_y1(id) → series float",
    "description": "Returns price of the first point of the line.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "line.get_y2",
    "namespace": "line",
    "syntax": "line.get_y2(id) → series float",
    "description": "Returns price of the second point of the line.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "line.new",
    "namespace": "line",
    "syntax": "line.new(first_point, second_point, xloc, extend, color, style, width, force_overlay) → series line",
    "description": "Creates new line object.",
    "parameters": [
      {
        "name": "first_point",
        "type": "chart.point",
        "description": "A chart.point object that specifies the line's starting coordinate.",
        "required": false
      },
      {
        "name": "second_point",
        "type": "chart.point",
        "description": "A chart.point object that specifies the line's ending coordinate.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "See description of x1 argument. Possible values: xloc.bar_index and xloc.bar_time. Default is xloc.bar_index.",
        "required": false
      },
      {
        "name": "extend",
        "type": "series string",
        "description": "If extend=extend.none, draws segment starting at point (x1, y1) and ending at point (x2, y2). If extend is equal to extend.right or extend.left, draws a ray starting at point (x1, y1) or (x2, y2), respectively. If extend=extend.both, draws a straight line that goes through these points. Default value is extend.none.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Line color.",
        "required": false
      },
      {
        "name": "style",
        "type": "series string",
        "description": "Line style. Possible values: line.style_solid, line.style_dotted, line.style_dashed, line.style_arrow_left, line.style_arrow_right, line.style_arrow_both.",
        "required": false
      },
      {
        "name": "width",
        "type": "series int",
        "description": "Line width in pixels.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      },
      {
        "name": "x1",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "y1",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "x2",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "y2",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series line",
    "example": "//@version=6indicator(\"line.new\")var line1 = line.new(0, low, bar_index, high, extend=extend.right)var line2 = line.new(time, open, time + 60 * 60 * 24, close, xloc=xloc.bar_time, style=line.style_dashed)line.set_x2(line1, 0)line.set_xloc(line1, time, time + 60 * 60 * 24, xloc.bar_time)line.set_color(line2, color.green)line.set_width(line2, 5)"
  },
  {
    "name": "line.set_color",
    "namespace": "line",
    "syntax": "line.set_color(id, color) → void",
    "description": "Sets the line color",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "New line color",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_extend",
    "namespace": "line",
    "syntax": "line.set_extend(id, extend) → void",
    "description": "Sets extending type of this line object. If extend=extend.none, draws segment starting at point (x1, y1) and ending at point (x2, y2). If extend is equal to extend.right or extend.left, draws a ray starting at point (x1, y1) or (x2, y2), respectively. If extend=extend.both, draws a straight line that goes through these points.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "extend",
        "type": "series string",
        "description": "New extending type.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_first_point",
    "namespace": "line",
    "syntax": "line.set_first_point(id, point) → void",
    "description": "Sets the first point of the id line to point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "A line object.",
        "required": false
      },
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_second_point",
    "namespace": "line",
    "syntax": "line.set_second_point(id, point) → void",
    "description": "Sets the second point of the id line to point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "A line object.",
        "required": false
      },
      {
        "name": "point",
        "type": "chart.point",
        "description": "A chart.point object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_style",
    "namespace": "line",
    "syntax": "line.set_style(id, style) → void",
    "description": "Sets the line style",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "style",
        "type": "series string",
        "description": "New line style.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_width",
    "namespace": "line",
    "syntax": "line.set_width(id, width) → void",
    "description": "Sets the line width.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "width",
        "type": "series int",
        "description": "New line width in pixels.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_x1",
    "namespace": "line",
    "syntax": "line.set_x1(id, x) → void",
    "description": "Sets bar index or bar time (depending on the xloc) of the first point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_x2",
    "namespace": "line",
    "syntax": "line.set_x2(id, x) → void",
    "description": "Sets bar index or bar time (depending on the xloc) of the second point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_xloc",
    "namespace": "line",
    "syntax": "line.set_xloc(id, x1, x2, xloc) → void",
    "description": "Sets x-location and new bar index/time values.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x1",
        "type": "series int",
        "description": "Bar index or bar time of the first point.",
        "required": false
      },
      {
        "name": "x2",
        "type": "series int",
        "description": "Bar index or bar time of the second point.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "New x-location value.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_xy1",
    "namespace": "line",
    "syntax": "line.set_xy1(id, x, y) → void",
    "description": "Sets bar index/time and price of the first point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "Price.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_xy2",
    "namespace": "line",
    "syntax": "line.set_xy2(id, x, y) → void",
    "description": "Sets bar index/time and price of the second point",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "x",
        "type": "series int",
        "description": "Bar index or bar time.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "Price.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_y1",
    "namespace": "line",
    "syntax": "line.set_y1(id, y) → void",
    "description": "Sets price of the first point",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "Price.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "line.set_y2",
    "namespace": "line",
    "syntax": "line.set_y2(id, y) → void",
    "description": "Sets price of the second point.",
    "parameters": [
      {
        "name": "id",
        "type": "series line",
        "description": "Line object.",
        "required": false
      },
      {
        "name": "y",
        "type": "series int/float",
        "description": "Price.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "linefill",
    "syntax": "linefill(x) → series linefill",
    "description": "Casts na to linefill.",
    "parameters": [
      {
        "name": "x",
        "type": "series linefill",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "series linefill",
    "example": ""
  },
  {
    "name": "linefill.delete",
    "namespace": "linefill",
    "syntax": "linefill.delete(id) → void",
    "description": "Deletes the specified linefill object. If it has already been deleted, does nothing.",
    "parameters": [
      {
        "name": "id",
        "type": "series linefill",
        "description": "A linefill object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "linefill.get_line1",
    "namespace": "linefill",
    "syntax": "linefill.get_line1(id) → series line",
    "description": "Returns the ID of the first line used in the id linefill.",
    "parameters": [
      {
        "name": "id",
        "type": "series linefill",
        "description": "A linefill object.",
        "required": false
      }
    ],
    "returns": "series line",
    "example": ""
  },
  {
    "name": "linefill.get_line2",
    "namespace": "linefill",
    "syntax": "linefill.get_line2(id) → series line",
    "description": "Returns the ID of the second line used in the id linefill.",
    "parameters": [
      {
        "name": "id",
        "type": "series linefill",
        "description": "A linefill object.",
        "required": false
      }
    ],
    "returns": "series line",
    "example": ""
  },
  {
    "name": "linefill.new",
    "namespace": "linefill",
    "syntax": "linefill.new(line1, line2, color) → series linefill",
    "description": "Creates a new linefill object and displays it on the chart, filling the space between line1 and line2 with the color specified in color.",
    "parameters": [
      {
        "name": "line1",
        "type": "series line",
        "description": "First line object.",
        "required": false
      },
      {
        "name": "line2",
        "type": "series line",
        "description": "Second line object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "The color used to fill the space between the lines.",
        "required": false
      }
    ],
    "returns": "series linefill",
    "example": ""
  },
  {
    "name": "linefill.set_color",
    "namespace": "linefill",
    "syntax": "linefill.set_color(id, color) → void",
    "description": "The function sets the color of the linefill object passed to it.",
    "parameters": [
      {
        "name": "id",
        "type": "series linefill",
        "description": "A linefill object.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "The color of the linefill object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "log.error",
    "namespace": "log",
    "syntax": "log.error(message) → void",
    "description": "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"error\" debug level.",
    "parameters": [
      {
        "name": "message",
        "type": "series string",
        "description": "Log message.",
        "required": false
      },
      {
        "name": "formatString",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg0",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg1",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"My strategy\", overlay = true, process_orders_on_close = true)bracketTickSizeInput = input.int(1000, \"Stoploss/Take-Profit distance (in ticks)\")longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    limitLevel = close * 1.01    log.info(\"Long limit order has been placed at {0}\", limitLevel)    strategy.order(\"My Long Entry Id\", strategy.long, limit = limitLevel)    log.info(\"Exit orders have been placed: Take-profit at {0}, Stop-loss at {1}\", close, limitLevel)    strategy.exit(\"Exit\", \"My Long Entry Id\", profit = bracketTickSizeInput, loss = bracketTickSizeInput)if strategy.opentrades > 10    log.warning(\"{0} positions opened in the same direction in a row. Try adjusting `bracketTickSizeInput`\", strategy.opentrades)last10Perc = strategy.initial_capital / 10 > strategy.equityif (last10Perc and not last10Perc[1])    log.error(\"The strategy has lost 90% of the initial capital!\")"
  },
  {
    "name": "log.info",
    "namespace": "log",
    "syntax": "log.info(message) → void",
    "description": "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"info\" debug level.",
    "parameters": [
      {
        "name": "message",
        "type": "series string",
        "description": "Log message.",
        "required": false
      },
      {
        "name": "formatString",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg0",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg1",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"My strategy\", overlay = true, process_orders_on_close = true)bracketTickSizeInput = input.int(1000, \"Stoploss/Take-Profit distance (in ticks)\")longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    limitLevel = close * 1.01    log.info(\"Long limit order has been placed at {0}\", limitLevel)    strategy.order(\"My Long Entry Id\", strategy.long, limit = limitLevel)    log.info(\"Exit orders have been placed: Take-profit at {0}, Stop-loss at {1}\", close, limitLevel)    strategy.exit(\"Exit\", \"My Long Entry Id\", profit = bracketTickSizeInput, loss = bracketTickSizeInput)if strategy.opentrades > 10    log.warning(\"{0} positions opened in the same direction in a row. Try adjusting `bracketTickSizeInput`\", strategy.opentrades)last10Perc = strategy.initial_capital / 10 > strategy.equityif (last10Perc and not last10Perc[1])    log.error(\"The strategy has lost 90% of the initial capital!\")"
  },
  {
    "name": "log.warning",
    "namespace": "log",
    "syntax": "log.warning(message) → void",
    "description": "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"warning\" debug level.",
    "parameters": [
      {
        "name": "message",
        "type": "series string",
        "description": "Log message.",
        "required": false
      },
      {
        "name": "formatString",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg0",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "arg1",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"My strategy\", overlay = true, process_orders_on_close = true)bracketTickSizeInput = input.int(1000, \"Stoploss/Take-Profit distance (in ticks)\")longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    limitLevel = close * 1.01    log.info(\"Long limit order has been placed at {0}\", limitLevel)    strategy.order(\"My Long Entry Id\", strategy.long, limit = limitLevel)    log.info(\"Exit orders have been placed: Take-profit at {0}, Stop-loss at {1}\", close, limitLevel)    strategy.exit(\"Exit\", \"My Long Entry Id\", profit = bracketTickSizeInput, loss = bracketTickSizeInput)if strategy.opentrades > 10    log.warning(\"{0} positions opened in the same direction in a row. Try adjusting `bracketTickSizeInput`\", strategy.opentrades)last10Perc = strategy.initial_capital / 10 > strategy.equityif (last10Perc and not last10Perc[1])    log.error(\"The strategy has lost 90% of the initial capital!\")"
  },
  {
    "name": "map.clear",
    "namespace": "map",
    "syntax": "map.clear(id) → void",
    "description": "Clears the map, removing all key-value pairs from it.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"map.clear example\")oddMap = map.new<int, bool>()oddMap.put(1, true)oddMap.put(2, false)oddMap.put(3, true)map.clear(oddMap)plot(oddMap.size())"
  },
  {
    "name": "map.contains",
    "namespace": "map",
    "syntax": "map.contains(id, key) → series bool",
    "description": "Returns true if the key was found in the id map, false otherwise.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      },
      {
        "name": "key",
        "type": "series <type of the map's elements>",
        "description": "The key to search in the map.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": "//@version=6indicator(\"map.includes example\")a = map.new<string, float>()a.put(\"open\", open)p = closeif map.contains(a, \"open\")    p := a.get(\"open\")plot(p)"
  },
  {
    "name": "map.copy",
    "namespace": "map",
    "syntax": "map.copy(id) → map<keyType, valueType>",
    "description": "Creates a copy of an existing map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object to copy.",
        "required": false
      }
    ],
    "returns": "map<keyType, valueType>",
    "example": "//@version=6indicator(\"map.copy example\")a = map.new<string, int>()a.put(\"example\", 1)b = map.copy(a)a := map.new<string, int>()a.put(\"example\", 2)plot(a.get(\"example\"))plot(b.get(\"example\"))"
  },
  {
    "name": "map.get",
    "namespace": "map",
    "syntax": "map.get(id, key) → <value_type>",
    "description": "Returns the value associated with the specified key in the id map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      },
      {
        "name": "key",
        "type": "series <type of the map's elements>",
        "description": "The key of the value to retrieve.",
        "required": false
      }
    ],
    "returns": "<value_type>",
    "example": "//@version=6indicator(\"map.get example\")a = map.new<int, int>()size = 10for i = 0 to size    a.put(i, size-i)plot(map.get(a, 1))"
  },
  {
    "name": "map.keys",
    "namespace": "map",
    "syntax": "map.keys(id) → array<type>",
    "description": "Returns an array of all the keys in the id map. The resulting array is a copy and any changes to it are not reflected in the original map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"map.keys example\")a = map.new<string, float>()a.put(\"open\", open)a.put(\"high\", high)a.put(\"low\", low)a.put(\"close\", close)keys = map.keys(a)ohlc = 0.0for key in keys    ohlc += a.get(key)plot(ohlc/4)"
  },
  {
    "name": "map.new<type,type>",
    "namespace": "map",
    "syntax": "map.new<keyType, valueType>() → map<keyType, valueType>",
    "description": "Creates a new map object: a collection that consists of key-value pairs, where all keys are of the keyType, and all values are of the valueType.",
    "parameters": [],
    "returns": "map<keyType, valueType>",
    "example": "//@version=6indicator(\"map.new<string, int> example\")a = map.new<string, int>()a.put(\"example\", 1)label.new(bar_index, close, str.tostring(a.get(\"example\")))"
  },
  {
    "name": "map.put",
    "namespace": "map",
    "syntax": "map.put(id, key, value) → <value_type>",
    "description": "Puts a new key-value pair into the id map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      },
      {
        "name": "key",
        "type": "series <type of the map's elements>",
        "description": "The key to put into the map.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the map's elements>",
        "description": "The key value to put into the map.",
        "required": false
      }
    ],
    "returns": "<value_type>",
    "example": "//@version=6indicator(\"map.put example\")a = map.new<string, float>()map.put(a, \"first\", 10)map.put(a, \"second\", 15)prevFirst = map.put(a, \"first\", 20)currFirst = a.get(\"first\")plot(prevFirst)plot(currFirst)"
  },
  {
    "name": "map.put_all",
    "namespace": "map",
    "syntax": "map.put_all(id, id2) → void",
    "description": "Puts all key-value pairs from the id2 map into the id map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object to append to.",
        "required": false
      },
      {
        "name": "id2",
        "type": "any map type",
        "description": "A map object to be appended.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"map.put_all example\")a = map.new<string, float>()b = map.new<string, float>()a.put(\"first\", 10)a.put(\"second\", 15)b.put(\"third\", 20)map.put_all(a, b)plot(a.get(\"third\"))"
  },
  {
    "name": "map.remove",
    "namespace": "map",
    "syntax": "map.remove(id, key) → <value_type>",
    "description": "Removes a key-value pair from the id map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      },
      {
        "name": "key",
        "type": "series <type of the map's elements>",
        "description": "The key of the pair to remove from the map.",
        "required": false
      }
    ],
    "returns": "<value_type>",
    "example": "//@version=6indicator(\"map.remove example\")a = map.new<string, color>()a.put(\"firstColor\", color.green)oldColorValue = map.remove(a, \"firstColor\")plot(close, color = oldColorValue)"
  },
  {
    "name": "map.size",
    "namespace": "map",
    "syntax": "map.size(id) → series int",
    "description": "Returns the number of key-value pairs in the id map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"map.size example\")a = map.new<int, int>()size = 10for i = 0 to size    a.put(i, size-i)plot(map.size(a))"
  },
  {
    "name": "map.values",
    "namespace": "map",
    "syntax": "map.values(id) → array<type>",
    "description": "Returns an array of all the values in the id map. The resulting array is a copy and any changes to it are not reflected in the original map.",
    "parameters": [
      {
        "name": "id",
        "type": "any map type",
        "description": "A map object.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"map.values example\")a = map.new<string, float>()a.put(\"open\", open)a.put(\"high\", high)a.put(\"low\", low)a.put(\"close\", close)values = map.values(a)ohlc = 0.0for value in values    ohlc += valueplot(ohlc/4)"
  },
  {
    "name": "math.abs",
    "namespace": "math",
    "syntax": "math.abs(number) → const int",
    "description": "Absolute value of number is number if number >= 0, or -number otherwise.",
    "parameters": [
      {
        "name": "number",
        "type": "const int",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const int",
    "flags": {
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.acos",
    "namespace": "math",
    "syntax": "math.acos(angle) → const float",
    "description": "The acos function returns the arccosine (in radians) of number such that cos(acos(y)) = y for y in range [-1, 1].",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "The value, in radians, to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.asin",
    "namespace": "math",
    "syntax": "math.asin(angle) → const float",
    "description": "The asin function returns the arcsine (in radians) of number such that sin(asin(y)) = y for y in range [-1, 1].",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "The value, in radians, to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.atan",
    "namespace": "math",
    "syntax": "math.atan(angle) → const float",
    "description": "The atan function returns the arctangent (in radians) of number such that tan(atan(y)) = y for any y.",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "The value, in radians, to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.avg",
    "namespace": "math",
    "syntax": "math.avg(number0, number1, ...) → simple float",
    "description": "Calculates average of all given series (elementwise).",
    "parameters": [
      {
        "name": "number0",
        "type": "unknown",
        "description": "",
        "required": true
      },
      {
        "name": "number1",
        "type": "unknown",
        "description": "",
        "required": true
      }
    ],
    "returns": "simple float",
    "flags": {
      "variadic": true,
      "minArgs": 2,
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.ceil",
    "namespace": "math",
    "syntax": "math.ceil(number) → const int",
    "description": "Rounds the specified number up to the smallest whole number (\"int\" value) that is greater than or equal to it.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to round.",
        "required": false
      }
    ],
    "returns": "const int",
    "flags": {
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.cos",
    "namespace": "math",
    "syntax": "math.cos(angle) → const float",
    "description": "The cos function returns the trigonometric cosine of an angle.",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "Angle, in radians.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.exp",
    "namespace": "math",
    "syntax": "math.exp(number) → const float",
    "description": "The exp function of number is e raised to the power of number, where e is Euler's number.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.floor",
    "namespace": "math",
    "syntax": "math.floor(number) → const int",
    "description": "Rounds the specified number down to the largest whole number (\"int\" value) that is less than or equal to it.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to round.",
        "required": false
      }
    ],
    "returns": "const int",
    "flags": {
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.log",
    "namespace": "math",
    "syntax": "math.log(number) → const float",
    "description": "Natural logarithm of any number > 0 is the unique y such that e^y = number.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.log10",
    "namespace": "math",
    "syntax": "math.log10(number) → const float",
    "description": "The common (or base 10) logarithm of number is the power to which 10 must be raised to obtain the number. 10^y = number.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.max",
    "namespace": "math",
    "syntax": "math.max(number0, number1, ...) → const int",
    "description": "Returns the greatest of multiple values.",
    "parameters": [
      {
        "name": "number0",
        "type": "unknown",
        "description": "",
        "required": true
      },
      {
        "name": "number1",
        "type": "unknown",
        "description": "",
        "required": true
      }
    ],
    "returns": "const int",
    "flags": {
      "variadic": true,
      "minArgs": 2,
      "polymorphic": "numeric"
    },
    "example": "//@version=6indicator(\"math.max\", overlay=true)plot(math.max(close, open))plot(math.max(close, math.max(open, 42)))"
  },
  {
    "name": "math.min",
    "namespace": "math",
    "syntax": "math.min(number0, number1, ...) → const int",
    "description": "Returns the smallest of multiple values.",
    "parameters": [
      {
        "name": "number0",
        "type": "unknown",
        "description": "",
        "required": true
      },
      {
        "name": "number1",
        "type": "unknown",
        "description": "",
        "required": true
      }
    ],
    "returns": "const int",
    "flags": {
      "variadic": true,
      "minArgs": 2,
      "polymorphic": "numeric"
    },
    "example": "//@version=6indicator(\"math.min\", overlay=true)plot(math.min(close, open))plot(math.min(close, math.min(open, 42)))"
  },
  {
    "name": "math.pow",
    "namespace": "math",
    "syntax": "math.pow(base, exponent) → const float",
    "description": "Mathematical power function.",
    "parameters": [
      {
        "name": "base",
        "type": "const int/float",
        "description": "Specify the base to use.",
        "required": false
      },
      {
        "name": "exponent",
        "type": "const int/float",
        "description": "Specifies the exponent.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": "//@version=6indicator(\"math.pow\", overlay=true)plot(math.pow(close, 2))"
  },
  {
    "name": "math.random",
    "namespace": "math",
    "syntax": "math.random(min, max, seed) → series float",
    "description": "Returns a pseudo-random value. The function will generate a different sequence of values for each script execution. Using the same value for the optional seed argument will produce a repeatable sequence.",
    "parameters": [
      {
        "name": "min",
        "type": "series int/float",
        "description": "The lower bound of the range of random values. The value is not included in the range. The default is 0.",
        "required": false
      },
      {
        "name": "max",
        "type": "series int/float",
        "description": "The upper bound of the range of random values. The value is not included in the range. The default is 1.",
        "required": false
      },
      {
        "name": "seed",
        "type": "series int",
        "description": "Optional argument. When the same seed is used, allows successive calls to the function to produce a repeatable set of values.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "math.round",
    "namespace": "math",
    "syntax": "math.round(number) → const int",
    "description": "Returns the value of number rounded to the nearest integer, with ties rounding up. If the precision parameter is used, returns a float value rounded to that amount of decimal places.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The value to be rounded.",
        "required": false
      },
      {
        "name": "precision",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "const int",
    "flags": {
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.round_to_mintick",
    "namespace": "math",
    "syntax": "math.round_to_mintick(number) → simple float",
    "description": "Returns the value rounded to the symbol's mintick, i.e. the nearest value that can be divided by syminfo.mintick, without the remainder, with ties rounding up.",
    "parameters": [
      {
        "name": "number",
        "type": "simple int/float",
        "description": "The value to be rounded.",
        "required": false
      }
    ],
    "returns": "simple float",
    "example": ""
  },
  {
    "name": "math.sign",
    "namespace": "math",
    "syntax": "math.sign(number) → const float",
    "description": "Sign (signum) of number is zero if number is zero, 1.0 if number is greater than zero, -1.0 if number is less than zero.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "flags": {
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.sin",
    "namespace": "math",
    "syntax": "math.sin(angle) → const float",
    "description": "The sin function returns the trigonometric sine of an angle.",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "Angle, in radians.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.sqrt",
    "namespace": "math",
    "syntax": "math.sqrt(number) → const float",
    "description": "Square root of any number >= 0 is the unique y >= 0 such that y^2 = number.",
    "parameters": [
      {
        "name": "number",
        "type": "const int/float",
        "description": "The number to use in the calculation.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.sum",
    "namespace": "math",
    "syntax": "math.sum(source, length) → series float",
    "description": "The sum function returns the sliding sum of last y values of x.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "flags": {
      "variadic": true,
      "minArgs": 1,
      "polymorphic": "numeric"
    },
    "example": ""
  },
  {
    "name": "math.tan",
    "namespace": "math",
    "syntax": "math.tan(angle) → const float",
    "description": "The tan function returns the trigonometric tangent of an angle.",
    "parameters": [
      {
        "name": "angle",
        "type": "const int/float",
        "description": "Angle, in radians.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "math.todegrees",
    "namespace": "math",
    "syntax": "math.todegrees(radians) → series float",
    "description": "Returns an approximately equivalent angle in degrees from an angle measured in radians.",
    "parameters": [
      {
        "name": "radians",
        "type": "series int/float",
        "description": "Angle in radians.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "math.toradians",
    "namespace": "math",
    "syntax": "math.toradians(degrees) → series float",
    "description": "Returns an approximately equivalent angle in radians from an angle measured in degrees.",
    "parameters": [
      {
        "name": "degrees",
        "type": "series int/float",
        "description": "Angle in degrees.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "matrix.add_col",
    "namespace": "matrix",
    "syntax": "matrix.add_col(id, column, array_id) → void",
    "description": "Inserts a new column at the column index of the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "The matrix object's ID (reference).",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "Optional. The index of the new column. Must be a value from 0 to matrix.columns(id). All existing columns with indices that are greater than or equal to this value increase their index by one. The default is matrix.columns(id).",
        "required": false
      },
      {
        "name": "array_id",
        "type": "any array type",
        "description": "Optional. The ID of an array to use as the new column. If the matrix is empty, the array can be of any size. Otherwise, its size must equal matrix.rows(id). By default, the function inserts a column of na values.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.add_col()` Example 1\")// Create a 2x3 \"int\" matrix containing values `0`.m = matrix.new<int>(2, 3, 0)// Add a column with `na` values to the matrix.matrix.add_col(m)// Display matrix elements.if barstate.islastconfirmedhistory    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix elements:\")    table.cell(t, 0, 1, str.tostring(m))"
  },
  {
    "name": "matrix.add_row",
    "namespace": "matrix",
    "syntax": "matrix.add_row(id, row, array_id) → void",
    "description": "Inserts a new row at the row index of the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "The matrix object's ID (reference).",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "Optional. The index of the new row. Must be a value from 0 to matrix.rows(id). All existing rows with indices that are greater than or equal to this value increase their index by one. The default is matrix.rows(id).",
        "required": false
      },
      {
        "name": "array_id",
        "type": "any array type",
        "description": "Optional. The ID of an array to use as the new row. If the matrix is empty, the array can be of any size. Otherwise, its size must equal matrix.columns(id). By default, the function inserts a row of na values.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.add_row()` Example 1\")// Create a 2x3 \"int\" matrix containing values `0`.m = matrix.new<int>(2, 3, 0)// Add a row with `na` values to the matrix.matrix.add_row(m)// Display matrix elements.if barstate.islastconfirmedhistory    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix elements:\")    table.cell(t, 0, 1, str.tostring(m))"
  },
  {
    "name": "matrix.avg",
    "namespace": "matrix",
    "syntax": "matrix.avg(id) → series float",
    "description": "The function calculates the average of all elements in the matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.avg()` Example\")// Create a 2x2 matrix.var m = matrix.new<int>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0, 1)matrix.set(m, 0, 1, 2)matrix.set(m, 1, 0, 3)matrix.set(m, 1, 1, 4)// Get the average value of the matrix.var x = matrix.avg(m)plot(x, 'Matrix average value')"
  },
  {
    "name": "matrix.col",
    "namespace": "matrix",
    "syntax": "matrix.col(id, column) → array<type>",
    "description": "The function creates a one-dimensional array from the elements of a matrix column.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "Index of the required column.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"`matrix.col()` Example\", \"\", true)// Create a 2x3 \"float\" matrix from `hlc3` values.m = matrix.new<float>(2, 3, hlc3)// Return an array with the values of the first column of matrix `m`.a = matrix.col(m, 0)// Plot the first value from the array `a`.plot(array.get(a, 0))"
  },
  {
    "name": "matrix.columns",
    "namespace": "matrix",
    "syntax": "matrix.columns(id) → series int",
    "description": "The function returns the number of columns in the matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"`matrix.columns()` Example\")// Create a 2x6 matrix with values `0`.var m = matrix.new<int>(2, 6, 0)// Get the quantity of columns in matrix `m`.var x = matrix.columns(m)// Display using a label.if barstate.islastconfirmedhistory    label.new(bar_index, high, \"Columns: \" + str.tostring(x) + \"\\n\" + str.tostring(m))"
  },
  {
    "name": "matrix.concat",
    "namespace": "matrix",
    "syntax": "matrix.concat(id1, id2) → matrix<type>",
    "description": "The function appends the m2 matrix to the m1 matrix.",
    "parameters": [
      {
        "name": "id1",
        "type": "any matrix type",
        "description": "Matrix object to concatenate into.",
        "required": false
      },
      {
        "name": "id2",
        "type": "any matrix type",
        "description": "Matrix object whose elements will be appended to id1.",
        "required": false
      }
    ],
    "returns": "matrix<type>",
    "example": "//@version=6indicator(\"`matrix.concat()` Example\")// Create a 2x4 \"int\" matrix containing values `0`.m1 = matrix.new<int>(2, 4, 0)// Create a 2x4 \"int\" matrix containing values `1`.m2 = matrix.new<int>(2, 4, 1)// Append matrix `m2` to `m1`.matrix.concat(m1, m2)// Display matrix elements.if barstate.islastconfirmedhistory    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix Elements:\")    table.cell(t, 0, 1, str.tostring(m1))"
  },
  {
    "name": "matrix.copy",
    "namespace": "matrix",
    "syntax": "matrix.copy(id) → matrix<type>",
    "description": "The function creates a new matrix which is a copy of the original.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object to copy.",
        "required": false
      }
    ],
    "returns": "matrix<type>",
    "example": "//@version=6indicator(\"`matrix.copy()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x3 \"float\" matrix with `1` values.    var m1 = matrix.new<float>(2, 3, 1)    // Copy the matrix to a new one.    // Note that unlike what `matrix.copy()` does,    // the simple assignment operation `m2 = m1`    // would NOT create a new copy of the `m1` matrix.    // It would merely create a copy of its ID referencing the same matrix.    var m2 = matrix.copy(m1)    // Display using a table.    var t = table.new(position.top_right, 5, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Matrix Copy:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.det",
    "namespace": "matrix",
    "syntax": "matrix.det(id) → series float",
    "description": "The function returns the determinant of a square matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.det` Example\")// Create a 2x2 matrix.var m = matrix.new<float>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0,  3)matrix.set(m, 0, 1,  7)matrix.set(m, 1, 0,  1)matrix.set(m, 1, 1, -4)// Get the determinant of the matrix.var x = matrix.det(m)plot(x, 'Matrix determinant')"
  },
  {
    "name": "matrix.diff",
    "namespace": "matrix",
    "syntax": "matrix.diff(id1, id2) → matrix<int>",
    "description": "The function returns a new matrix resulting from the subtraction between matrices id1 and id2, or of matrix id1 and an id2 scalar (a numerical value).",
    "parameters": [
      {
        "name": "id1",
        "type": "matrix<int>",
        "description": "Matrix to subtract from.",
        "required": false
      },
      {
        "name": "id2",
        "type": "series int/float/matrix<int>",
        "description": "Matrix object or a scalar value to be subtracted.",
        "required": false
      }
    ],
    "returns": "matrix<int>",
    "example": "//@version=6indicator(\"`matrix.diff()` Example 1\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x3 matrix containing values `5`.    var m1 = matrix.new<float>(2, 3, 5)    // Create a 2x3 matrix containing values `4`.    var m2 = matrix.new<float>(2, 3, 4)    // Create a new matrix containing the difference between matrices `m1` and `m2`.    var m3 = matrix.diff(m1, m2)    // Display using a table.    var t = table.new(position.top_right, 1, 2, color.green)    table.cell(t, 0, 0, \"Difference between two matrices:\")    table.cell(t, 0, 1, str.tostring(m3))"
  },
  {
    "name": "matrix.eigenvalues",
    "namespace": "matrix",
    "syntax": "matrix.eigenvalues(id) → array<float>",
    "description": "The function returns an array containing the eigenvalues of a square matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "array<float>",
    "example": "//@version=6indicator(\"`matrix.eigenvalues()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 2)    matrix.set(m1, 0, 1, 4)    matrix.set(m1, 1, 0, 6)    matrix.set(m1, 1, 1, 8)    // Get the eigenvalues of the matrix.    tr = matrix.eigenvalues(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix elements:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Array of Eigenvalues:\")    table.cell(t, 1, 1, str.tostring(tr))"
  },
  {
    "name": "matrix.eigenvectors",
    "namespace": "matrix",
    "syntax": "matrix.eigenvectors(id) → matrix<float>",
    "description": "Returns a matrix of eigenvectors, in which each column is an eigenvector of the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "matrix<float>",
    "example": "//@version=6indicator(\"`matrix.eigenvectors()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix    var m1 = matrix.new<int>(2, 2, 1)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 2)    matrix.set(m1, 0, 1, 4)    matrix.set(m1, 1, 0, 6)    matrix.set(m1, 1, 1, 8)    // Get the eigenvectors of the matrix.    m2 = matrix.eigenvectors(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix Elements:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Matrix Eigenvectors:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.elements_count",
    "namespace": "matrix",
    "syntax": "matrix.elements_count(id) → series int",
    "description": "The function returns the total number of all matrix elements.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "matrix.fill",
    "namespace": "matrix",
    "syntax": "matrix.fill(id, value, from_row, to_row, from_column, to_column) → void",
    "description": "The function fills a rectangular area of the id matrix defined by the indices from_column to to_column (not including it) and from_row to to_row(not including it) with the value.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the matrix's elements>",
        "description": "The value to fill with.",
        "required": false
      },
      {
        "name": "from_row",
        "type": "series int",
        "description": "Row index from which the fill will begin (inclusive). Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "to_row",
        "type": "series int",
        "description": "Row index where the fill will end (not inclusive). Optional. The default value is matrix.rows().",
        "required": false
      },
      {
        "name": "from_column",
        "type": "series int",
        "description": "Column index from which the fill will begin (inclusive). Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "to_column",
        "type": "series int",
        "description": "Column index where the fill will end (non inclusive). Optional. The default value is matrix.columns().",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.fill()` Example\")// Create a 4x5 \"int\" matrix containing values `0`.m = matrix.new<float>(4, 5, 0)// Fill the intersection of rows 1 to 2 and columns 2 to 3 of the matrix with `hl2` values.matrix.fill(m, hl2, 0, 2, 1, 3)// Display using a label.if barstate.islastconfirmedhistory    label.new(bar_index, high, str.tostring(m))"
  },
  {
    "name": "matrix.get",
    "namespace": "matrix",
    "syntax": "matrix.get(id, row, column) → <matrix_type>",
    "description": "The function returns the element with the specified index of the matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "Index of the required row.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "Index of the required column.",
        "required": false
      }
    ],
    "returns": "<matrix_type>",
    "example": "//@version=6indicator(\"`matrix.get()` Example\", \"\", true)// Create a 2x3 \"float\" matrix from the `hl2` values.m = matrix.new<float>(2, 3, hl2)// Return the value of the element at index [0, 0] of matrix `m`.x = matrix.get(m, 0, 0)plot(x)"
  },
  {
    "name": "matrix.inv",
    "namespace": "matrix",
    "syntax": "matrix.inv(id) → matrix<float>",
    "description": "The function returns the inverse of a square matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "matrix<float>",
    "example": "//@version=6indicator(\"`matrix.inv()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Inverse of the matrix.    var m2 = matrix.inv(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Inverse matrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.is_antidiagonal",
    "namespace": "matrix",
    "syntax": "matrix.is_antidiagonal(id) → series bool",
    "description": "The function determines if the matrix is anti-diagonal (all elements outside the secondary diagonal are zero).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_antisymmetric",
    "namespace": "matrix",
    "syntax": "matrix.is_antisymmetric(id) → series bool",
    "description": "The function determines if a matrix is antisymmetric (its transpose equals its negative).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_binary",
    "namespace": "matrix",
    "syntax": "matrix.is_binary(id) → series bool",
    "description": "The function determines if the matrix is binary (when all elements of the matrix are 0 or 1).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_diagonal",
    "namespace": "matrix",
    "syntax": "matrix.is_diagonal(id) → series bool",
    "description": "The function determines if the matrix is diagonal (all elements outside the main diagonal are zero).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_identity",
    "namespace": "matrix",
    "syntax": "matrix.is_identity(id) → series bool",
    "description": "The function determines if a matrix is an identity matrix (elements with ones on the main diagonal and zeros elsewhere).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_square",
    "namespace": "matrix",
    "syntax": "matrix.is_square(id) → series bool",
    "description": "The function determines if the matrix is square (it has the same number of rows and columns).",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_stochastic",
    "namespace": "matrix",
    "syntax": "matrix.is_stochastic(id) → series bool",
    "description": "The function determines if the matrix is stochastic.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_symmetric",
    "namespace": "matrix",
    "syntax": "matrix.is_symmetric(id) → series bool",
    "description": "The function determines if a square matrix is symmetric (elements are symmetric with respect to the main diagonal).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_triangular",
    "namespace": "matrix",
    "syntax": "matrix.is_triangular(id) → series bool",
    "description": "The function determines if the matrix is triangular (if all elements above or below the main diagonal are zero).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to test.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.is_zero",
    "namespace": "matrix",
    "syntax": "matrix.is_zero(id) → series bool",
    "description": "The function determines if all elements of the matrix are zero.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "Matrix object to check.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "matrix.kron",
    "namespace": "matrix",
    "syntax": "matrix.kron(id1, id2) → matrix<float>",
    "description": "The function returns the Kronecker product for the id1 and id2 matrices.",
    "parameters": [
      {
        "name": "id1",
        "type": "matrix<int/float>",
        "description": "First matrix object.",
        "required": false
      },
      {
        "name": "id2",
        "type": "matrix<int/float>",
        "description": "Second matrix object.",
        "required": false
      }
    ],
    "returns": "matrix<float>",
    "example": "//@version=6indicator(\"`matrix.kron()` Example\")// Display using a table.if barstate.islastconfirmedhistory    // Create two matrices with default values `1` and `2`.    var m1 = matrix.new<float>(2, 2, 1)    var m2 = matrix.new<float>(2, 2, 2)    // Calculate the Kronecker product of the matrices.    var m3 = matrix.kron(m1, m2)    // Display matrix elements.    var t = table.new(position.top_right, 5, 2, color.green)    table.cell(t, 0, 0, \"Matrix 1:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 1, \"⊗\")    table.cell(t, 2, 0, \"Matrix 2:\")    table.cell(t, 2, 1, str.tostring(m2))    table.cell(t, 3, 1, \"=\")    table.cell(t, 4, 0, \"Kronecker product:\")    table.cell(t, 4, 1, str.tostring(m3))"
  },
  {
    "name": "matrix.max",
    "namespace": "matrix",
    "syntax": "matrix.max(id) → series float",
    "description": "The function returns the largest value from the matrix elements.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.max()` Example\")// Create a 2x2 matrix.var m = matrix.new<int>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0, 1)matrix.set(m, 0, 1, 2)matrix.set(m, 1, 0, 3)matrix.set(m, 1, 1, 4)// Get the maximum value in the matrix.var x = matrix.max(m)plot(x, 'Matrix maximum value')"
  },
  {
    "name": "matrix.median",
    "namespace": "matrix",
    "syntax": "matrix.median(id) → series float",
    "description": "The function calculates the median (\"the middle\" value) of matrix elements.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.median()` Example\")// Create a 2x2 matrix.m = matrix.new<int>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0, 1)matrix.set(m, 0, 1, 2)matrix.set(m, 1, 0, 3)matrix.set(m, 1, 1, 4)// Get the median of the matrix.x = matrix.median(m)plot(x, 'Median of the matrix')"
  },
  {
    "name": "matrix.min",
    "namespace": "matrix",
    "syntax": "matrix.min(id) → series float",
    "description": "The function returns the smallest value from the matrix elements.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.min()` Example\")// Create a 2x2 matrix.var m = matrix.new<int>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0, 1)matrix.set(m, 0, 1, 2)matrix.set(m, 1, 0, 3)matrix.set(m, 1, 1, 4)// Get the minimum value from the matrix.var x = matrix.min(m)plot(x, 'Matrix minimum value')"
  },
  {
    "name": "matrix.mode",
    "namespace": "matrix",
    "syntax": "matrix.mode(id) → series float",
    "description": "The function calculates the mode of the matrix, which is the most frequently occurring value from the matrix elements. When there are multiple values occurring equally frequently, the function returns the smallest of those values.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.mode()` Example\")// Create a 2x2 matrix.var m = matrix.new<int>(2, 2, na)// Fill the matrix with values.matrix.set(m, 0, 0, 0)matrix.set(m, 0, 1, 0)matrix.set(m, 1, 0, 1)matrix.set(m, 1, 1, 1)// Get the mode of the matrix.var x = matrix.mode(m)plot(x, 'Mode of the matrix')"
  },
  {
    "name": "matrix.mult",
    "namespace": "matrix",
    "syntax": "matrix.mult(id1, id2) → array<int>",
    "description": "The function returns a new matrix resulting from the product between the matrices id1 and id2, or between an id1 matrix and an id2 scalar (a numerical value), or between an id1 matrix and an id2 vector (an array of values).",
    "parameters": [
      {
        "name": "id1",
        "type": "matrix<int>",
        "description": "First matrix object.",
        "required": false
      },
      {
        "name": "id2",
        "type": "array<int>",
        "description": "Second matrix object, value or array.",
        "required": false
      }
    ],
    "returns": "array<int>",
    "example": "//@version=6indicator(\"`matrix.mult()` Example 1\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 6x2 matrix containing values `5`.    var m1 = matrix.new<float>(6, 2, 5)    // Create a 2x3 matrix containing values `4`.    // Note that it must have the same quantity of rows as there are columns in the first matrix.    var m2 = matrix.new<float>(2, 3, 4)    // Create a new matrix from the multiplication of the two matrices.    var m3 = matrix.mult(m1, m2)    // Display using a table.    var t = table.new(position.top_right, 1, 2, color.green)    table.cell(t, 0, 0, \"Product of two matrices:\")    table.cell(t, 0, 1, str.tostring(m3))"
  },
  {
    "name": "matrix.new<type>",
    "namespace": "matrix",
    "syntax": "matrix.new<type>(rows, columns, initial_value) → matrix<type>",
    "description": "The function creates a new matrix object. A matrix is a two-dimensional data structure containing rows and columns. All elements in the matrix must be of the type specified in the type template (\"<type>\").",
    "parameters": [
      {
        "name": "rows",
        "type": "series int",
        "description": "Initial row count of the matrix. Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "columns",
        "type": "series int",
        "description": "Initial column count of the matrix. Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "initial_value",
        "type": "<matrix_type>",
        "description": "Initial value of all matrix elements. Optional. The default is 'na'.",
        "required": false
      }
    ],
    "returns": "matrix<type>",
    "example": "//@version=6indicator(\"`matrix.new<type>()` Example 1\")// Create a 2x3 (2 rows x 3 columns) \"int\" matrix with values zero.var m = matrix.new<int>(2, 3, 0)// Display using a label.if barstate.islastconfirmedhistory    label.new(bar_index, high, str.tostring(m))"
  },
  {
    "name": "matrix.pinv",
    "namespace": "matrix",
    "syntax": "matrix.pinv(id) → matrix<float>",
    "description": "The function returns the pseudoinverse of a matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "matrix<float>",
    "example": "//@version=6indicator(\"`matrix.pinv()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Pseudoinverse of the matrix.    var m2 = matrix.pinv(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Pseudoinverse matrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.pow",
    "namespace": "matrix",
    "syntax": "matrix.pow(id, power) → matrix<float>",
    "description": "The function calculates the product of the matrix by itself power times.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "power",
        "type": "series int",
        "description": "The number of times the matrix will be multiplied by itself.",
        "required": false
      }
    ],
    "returns": "matrix<float>",
    "example": "//@version=6indicator(\"`matrix.pow()` Example\")// Display using a table.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, 2)    // Calculate the power of three of the matrix.    var m2 = matrix.pow(m1, 3)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Matrix³:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.rank",
    "namespace": "matrix",
    "syntax": "matrix.rank(id) → series int",
    "description": "The function calculates the rank of the matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"`matrix.rank()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Get the rank of the matrix.    r = matrix.rank(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix elements:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Rank of the matrix:\")    table.cell(t, 1, 1, str.tostring(r))"
  },
  {
    "name": "matrix.remove_col",
    "namespace": "matrix",
    "syntax": "matrix.remove_col(id, column) → array<type>",
    "description": "The function removes the column at column index of the id matrix and returns an array containing the removed column's values.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the column to be removed. Optional. The default value is matrix.columns().",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"matrix_remove_col\", overlay = true)// Create a 2x2 matrix with ones.var matrixOrig = matrix.new<int>(2, 2, 1)// Set values to the 'matrixOrig' matrix.matrix.set(matrixOrig, 0, 1, 2)matrix.set(matrixOrig, 1, 0, 3)matrix.set(matrixOrig, 1, 1, 4)// Create a copy of the 'matrixOrig' matrix.matrixCopy = matrix.copy(matrixOrig)// Remove the first column from the `matrixCopy` matrix.arr = matrix.remove_col(matrixCopy, 0)// Display matrix elements.if barstate.islastconfirmedhistory    var t = table.new(position.top_right, 3, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(matrixOrig))    table.cell(t, 1, 0, \"Removed Elements:\")    table.cell(t, 1, 1, str.tostring(arr))    table.cell(t, 2, 0, \"Result Matrix:\")    table.cell(t, 2, 1, str.tostring(matrixCopy))"
  },
  {
    "name": "matrix.remove_row",
    "namespace": "matrix",
    "syntax": "matrix.remove_row(id, row) → array<type>",
    "description": "The function removes the row at row index of the id matrix and returns an array containing the removed row's values.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the row to be deleted. Optional. The default value is matrix.rows().",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"matrix_remove_row\", overlay = true)// Create a 2x2 \"int\" matrix containing values `1`.var matrixOrig = matrix.new<int>(2, 2, 1)// Set values to the 'matrixOrig' matrix.matrix.set(matrixOrig, 0, 1, 2)matrix.set(matrixOrig, 1, 0, 3)matrix.set(matrixOrig, 1, 1, 4)// Create a copy of the 'matrixOrig' matrix.matrixCopy = matrix.copy(matrixOrig)// Remove the first row from the matrix `matrixCopy`.arr = matrix.remove_row(matrixCopy, 0)// Display matrix elements.if barstate.islastconfirmedhistory    var t = table.new(position.top_right, 3, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(matrixOrig))    table.cell(t, 1, 0, \"Removed Elements:\")    table.cell(t, 1, 1, str.tostring(arr))    table.cell(t, 2, 0, \"Result Matrix:\")    table.cell(t, 2, 1, str.tostring(matrixCopy))"
  },
  {
    "name": "matrix.reshape",
    "namespace": "matrix",
    "syntax": "matrix.reshape(id, rows, columns) → void",
    "description": "The function rebuilds the id matrix to rows x cols dimensions.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "rows",
        "type": "series int",
        "description": "The number of rows of the reshaped matrix.",
        "required": false
      },
      {
        "name": "columns",
        "type": "series int",
        "description": "The number of columns of the reshaped matrix.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.reshape()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x3 matrix.    var m1 = matrix.new<float>(2, 3)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 0, 2, 3)    matrix.set(m1, 1, 0, 4)    matrix.set(m1, 1, 1, 5)    matrix.set(m1, 1, 2, 6)    // Copy the matrix to a new one.    var m2 = matrix.copy(m1)    // Reshape the copy to a 3x2.    matrix.reshape(m2, 3, 2)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Reshaped matrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.reverse",
    "namespace": "matrix",
    "syntax": "matrix.reverse(id) → void",
    "description": "The function reverses the order of rows and columns in the matrix id. The first row and first column become the last, and the last become the first.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.reverse()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Copy the matrix to a new one.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Copy matrix elements to a new matrix.    var m2 = matrix.copy(m1)    // Reverse the `m2` copy of the original matrix.    matrix.reverse(m2)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Reversed matrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.row",
    "namespace": "matrix",
    "syntax": "matrix.row(id, row) → array<type>",
    "description": "The function creates a one-dimensional array from the elements of a matrix row.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "Index of the required row.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"`matrix.row()` Example\", \"\", true)// Create a 2x3 \"float\" matrix from `hlc3` values.m = matrix.new<float>(2, 3, hlc3)// Return an array with the values of the first row of the matrix.a = matrix.row(m, 0)// Plot the first value from the array `a`.plot(array.get(a, 0))"
  },
  {
    "name": "matrix.rows",
    "namespace": "matrix",
    "syntax": "matrix.rows(id) → series int",
    "description": "The function returns the number of rows in the matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"`matrix.rows()` Example\")// Create a 2x6 matrix with values `0`.var m = matrix.new<int>(2, 6, 0)// Get the quantity of rows in the matrix.var x = matrix.rows(m)// Display using a label.if barstate.islastconfirmedhistory    label.new(bar_index, high, \"Rows: \" + str.tostring(x) + \"\\n\" + str.tostring(m))"
  },
  {
    "name": "matrix.set",
    "namespace": "matrix",
    "syntax": "matrix.set(id, row, column, value) → void",
    "description": "The function assigns value to the element at the row and column of the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The row index of the element to be modified.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The column index of the element to be modified.",
        "required": false
      },
      {
        "name": "value",
        "type": "series <type of the matrix's elements>",
        "description": "The new value to be set.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.set()` Example\")// Create a 2x3 \"int\" matrix containing values `4`.m = matrix.new<int>(2, 3, 4)// Replace the value of element at row 1 and column 2 with value `3`.matrix.set(m, 0, 1, 3)// Display using a label.if barstate.islastconfirmedhistory    label.new(bar_index, high, str.tostring(m))"
  },
  {
    "name": "matrix.sort",
    "namespace": "matrix",
    "syntax": "matrix.sort(id, column, order) → void",
    "description": "The function rearranges the rows in the id matrix following the sorted order of the values in the column.",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float/string>",
        "description": "A matrix object to be sorted.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "Index of the column whose sorted values determine the new order of rows. Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "order",
        "type": "series sort_order",
        "description": "The sort order. Possible values: order.ascending (default), order.descending.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.sort()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<float>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 3)    matrix.set(m1, 0, 1, 4)    matrix.set(m1, 1, 0, 1)    matrix.set(m1, 1, 1, 2)    // Copy the matrix to a new one.    var m2 = matrix.copy(m1)    // Sort the rows of `m2` using the default arguments (first column and ascending order).    matrix.sort(m2)    // Display using a table.    if barstate.islastconfirmedhistory        var t = table.new(position.top_right, 2, 2, color.green)        table.cell(t, 0, 0, \"Original matrix:\")        table.cell(t, 0, 1, str.tostring(m1))        table.cell(t, 1, 0, \"Sorted matrix:\")        table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.submatrix",
    "namespace": "matrix",
    "syntax": "matrix.submatrix(id, from_row, to_row, from_column, to_column) → matrix<type>",
    "description": "The function extracts a submatrix of the id matrix within the specified indices.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "from_row",
        "type": "series int",
        "description": "Index of the row from which the extraction will begin (inclusive). Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "to_row",
        "type": "series int",
        "description": "Index of the row where the extraction will end (non inclusive). Optional. The default value is matrix.rows().",
        "required": false
      },
      {
        "name": "from_column",
        "type": "series int",
        "description": "Index of the column from which the extraction will begin (inclusive). Optional. The default value is 0.",
        "required": false
      },
      {
        "name": "to_column",
        "type": "series int",
        "description": "Index of the column where the extraction will end (non inclusive). Optional. The default value is matrix.columns().",
        "required": false
      }
    ],
    "returns": "matrix<type>",
    "example": "//@version=6indicator(\"`matrix.submatrix()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x3 matrix matrix with values `0`.    var m1 = matrix.new<int>(2, 3, 0)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 0, 2, 3)    matrix.set(m1, 1, 0, 4)    matrix.set(m1, 1, 1, 5)    matrix.set(m1, 1, 2, 6)    // Create a 2x2 submatrix of the `m1` matrix.    var m2 = matrix.submatrix(m1, 0, 2, 1, 3)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original Matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Submatrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.sum",
    "namespace": "matrix",
    "syntax": "matrix.sum(id1, id2) → matrix<int>",
    "description": "The function returns a new matrix resulting from the sum of two matrices id1 and id2, or of an id1 matrix and an id2 scalar (a numerical value).",
    "parameters": [
      {
        "name": "id1",
        "type": "matrix<int>",
        "description": "First matrix object.",
        "required": false
      },
      {
        "name": "id2",
        "type": "series int/float/matrix<int>",
        "description": "Second matrix object, or scalar value.",
        "required": false
      }
    ],
    "returns": "matrix<int>",
    "example": "//@version=6indicator(\"`matrix.sum()` Example 1\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x3 matrix containing values `5`.    var m1 = matrix.new<float>(2, 3, 5)    // Create a 2x3 matrix containing values `4`.    var m2 = matrix.new<float>(2, 3, 4)    // Create a new matrix that sums matrices `m1` and `m2`.    var m3 = matrix.sum(m1, m2)    // Display using a table.    var t = table.new(position.top_right, 1, 2, color.green)    table.cell(t, 0, 0, \"Sum of two matrices:\")    table.cell(t, 0, 1, str.tostring(m3))"
  },
  {
    "name": "matrix.swap_columns",
    "namespace": "matrix",
    "syntax": "matrix.swap_columns(id, column1, column2) → void",
    "description": "The function swaps the columns at the index column1 and column2 in the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "column1",
        "type": "series int",
        "description": "Index of the first column to be swapped.",
        "required": false
      },
      {
        "name": "column2",
        "type": "series int",
        "description": "Index of the second column to be swapped.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.swap_columns()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix with ‘na’ values.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Copy the matrix to a new one.    var m2 = matrix.copy(m1)    // Swap the first and second columns of the matrix copy.    matrix.swap_columns(m2, 0, 1)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Swapped columns in copy:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.swap_rows",
    "namespace": "matrix",
    "syntax": "matrix.swap_rows(id, row1, row2) → void",
    "description": "The function swaps the rows at the index row1 and row2 in the id matrix.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      },
      {
        "name": "row1",
        "type": "series int",
        "description": "Index of the first row to be swapped.",
        "required": false
      },
      {
        "name": "row2",
        "type": "series int",
        "description": "Index of the second row to be swapped.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"`matrix.swap_rows()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 3x2 matrix with ‘na’ values.    var m1 = matrix.new<int>(3, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    matrix.set(m1, 2, 0, 5)    matrix.set(m1, 2, 1, 6)    // Copy the matrix to a new one.    var m2 = matrix.copy(m1)    // Swap the first and second rows of the matrix copy.    matrix.swap_rows(m2, 0, 1)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Swapped rows in copy:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "matrix.trace",
    "namespace": "matrix",
    "syntax": "matrix.trace(id) → series float",
    "description": "The function calculates the trace of a matrix (the sum of the main diagonal's elements).",
    "parameters": [
      {
        "name": "id",
        "type": "matrix<int/float>",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"`matrix.trace()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<int>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Get the trace of the matrix.    tr = matrix.trace(m1)    // Display matrix elements.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Matrix elements:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Trace of the matrix:\")    table.cell(t, 1, 1, str.tostring(tr))"
  },
  {
    "name": "matrix.transpose",
    "namespace": "matrix",
    "syntax": "matrix.transpose(id) → matrix<type>",
    "description": "The function creates a new, transposed version of the id. This interchanges the row and column index of each element.",
    "parameters": [
      {
        "name": "id",
        "type": "any matrix type",
        "description": "A matrix object.",
        "required": false
      }
    ],
    "returns": "matrix<type>",
    "example": "//@version=6indicator(\"`matrix.transpose()` Example\")// For efficiency, execute this code only once.if barstate.islastconfirmedhistory    // Create a 2x2 matrix.    var m1 = matrix.new<float>(2, 2, na)    // Fill the matrix with values.    matrix.set(m1, 0, 0, 1)    matrix.set(m1, 0, 1, 2)    matrix.set(m1, 1, 0, 3)    matrix.set(m1, 1, 1, 4)    // Create a transpose of the matrix.    var m2 = matrix.transpose(m1)    // Display using a table.    var t = table.new(position.top_right, 2, 2, color.green)    table.cell(t, 0, 0, \"Original matrix:\")    table.cell(t, 0, 1, str.tostring(m1))    table.cell(t, 1, 0, \"Transposed matrix:\")    table.cell(t, 1, 1, str.tostring(m2))"
  },
  {
    "name": "max_bars_back",
    "syntax": "max_bars_back(var, num) → void",
    "description": "Function sets the maximum number of bars that is available for historical reference of a given built-in or user variable. When operator '[]' is applied to a variable - it is a reference to a historical value of that variable.",
    "parameters": [
      {
        "name": "var",
        "type": "series int/float/bool/color/label/line",
        "description": "Series variable identifier for which history buffer should be resized. Possible values are: 'open', 'high', 'low', 'close', 'volume', 'time', or any user defined variable id.",
        "required": false
      },
      {
        "name": "num",
        "type": "const int",
        "description": "History buffer size which is the number of bars that could be referenced for variable 'var'.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"max_bars_back\")close_() => closedepth() => 400d = depth()v = close_()max_bars_back(v, 500)out = if bar_index > 0    v[d]else    vplot(out)"
  },
  {
    "name": "minute",
    "syntax": "minute(time, timezone) → series int",
    "description": "",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "month",
    "syntax": "month(time, timezone) → series int",
    "description": "",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "na",
    "syntax": "na(x) → simple bool",
    "description": "Tests if x is na.",
    "parameters": [
      {
        "name": "x",
        "type": "simple int/float",
        "description": "Value to be tested.",
        "required": false
      }
    ],
    "returns": "simple bool",
    "example": "//@version=6indicator(\"na\")// Use the `na()` function to test for `na`.plot(na(close[1]) ? close : close[1])// ALTERNATIVE// `nz()` also tests `close[1]` for `na`. It returns `close[1]` if it is not `na`, and `close` if it is.plot(nz(close[1], close))"
  },
  {
    "name": "nz",
    "syntax": "nz(source, replacement) → simple color",
    "description": "Replaces na (undefined) values with either a type-specific default value or a specified replacement.",
    "parameters": [
      {
        "name": "source",
        "type": "simple color",
        "description": "The source series to process.",
        "required": false
      },
      {
        "name": "replacement",
        "type": "simple color",
        "description": "Optional. The value the function uses to replace na values in the source series. The default depends on the source type: 0 for \"int\", 0.0 for \"float\", or #00000000 for \"color\".",
        "required": false
      }
    ],
    "returns": "simple color",
    "flags": {
      "polymorphic": "input"
    },
    "example": "//@version=6indicator(\"nz\", overlay=true)plot(nz(ta.sma(close, 100)))"
  },
  {
    "name": "plot",
    "syntax": "plot(series, title, color, linewidth, style, trackprice, histbase, offset, join, editable, show_last, display, format, precision, force_overlay, linestyle) → plot",
    "description": "Plots a series of data on the chart.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of data to be plotted. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plot.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the plot. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "linewidth",
        "type": "input int",
        "description": "Width of the plotted line. Default value is 1. Not applicable to every style.",
        "required": false
      },
      {
        "name": "style",
        "type": "input plot_style",
        "description": "Type of plot. Possible values are: plot.style_line, plot.style_stepline, plot.style_stepline_diamond, plot.style_histogram, plot.style_cross, plot.style_area, plot.style_columns, plot.style_circles, plot.style_linebr, plot.style_areabr, plot.style_steplinebr. Default value is plot.style_line.",
        "required": false
      },
      {
        "name": "trackprice",
        "type": "input bool",
        "description": "If true then a horizontal price line will be shown at the level of the last indicator value. Default is false.",
        "required": false
      },
      {
        "name": "histbase",
        "type": "input int/float",
        "description": "The price value used as the reference level when rendering plot with plot.style_histogram, plot.style_columns or plot.style_area style. Default is 0.0.",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts the plot to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "join",
        "type": "input bool",
        "description": "If true then plot points will be joined with line, applicable only to plot.style_cross and plot.style_circles styles. Default is false.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plot style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      },
      {
        "name": "linestyle",
        "type": "input plot_line_style",
        "description": "Optional. A modifier for plot styles that display lines. It specifies whether the plotted line is solid (plot.linestyle_solid), dashed (plot.linestyle_dashed), or dotted (plot.linestyle_dotted). The modifier applies only when the function uses one of the following style arguments: plot.style_line, plot.style_linebr, plot.style_stepline, plot.style_stepline_diamond, and plot.style_area. The default is plot.linestyle_solid.",
        "required": false
      }
    ],
    "returns": "plot",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plot\")plot(high+low, title='Title', color=color.new(#00ffaa, 70), linewidth=2, style=plot.style_area, offset=15, trackprice=true)// You may fill the background between any two plots with a fill() function:p1 = plot(open)p2 = plot(close)fill(p1, p2, color=color.new(color.green, 90))"
  },
  {
    "name": "plotarrow",
    "syntax": "plotarrow(series, title, colorup, colordown, offset, minheight, maxheight, editable, show_last, display, format, precision, force_overlay) → void",
    "description": "Plots up and down arrows on the chart. Up arrow is drawn at every indicator positive value, down arrow is drawn at every negative value. If indicator returns na then no arrow is drawn. Arrows has different height, the more absolute indicator value the longer arrow is drawn.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of data to be plotted as arrows. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plot.",
        "required": false
      },
      {
        "name": "colorup",
        "type": "series color",
        "description": "Color of the up arrows. Optional argument.",
        "required": false
      },
      {
        "name": "colordown",
        "type": "series color",
        "description": "Color of the down arrows. Optional argument.",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts arrows to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "minheight",
        "type": "input int",
        "description": "Minimal possible arrow height in pixels. Default is 5.",
        "required": false
      },
      {
        "name": "maxheight",
        "type": "input int",
        "description": "Maximum possible arrow height in pixels. Default is 100.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plotarrow style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plotarrow example\", overlay=true)codiff = close - openplotarrow(codiff, colorup=color.new(color.teal,40), colordown=color.new(color.orange, 40))"
  },
  {
    "name": "plotbar",
    "syntax": "plotbar(open, high, low, close, title, color, editable, show_last, display, format, precision, force_overlay) → void",
    "description": "Plots ohlc bars on the chart.",
    "parameters": [
      {
        "name": "open",
        "type": "series int/float",
        "description": "Open series of data to be used as open values of bars. Required argument.",
        "required": true
      },
      {
        "name": "high",
        "type": "series int/float",
        "description": "High series of data to be used as high values of bars. Required argument.",
        "required": true
      },
      {
        "name": "low",
        "type": "series int/float",
        "description": "Low series of data to be used as low values of bars. Required argument.",
        "required": true
      },
      {
        "name": "close",
        "type": "series int/float",
        "description": "Close series of data to be used as close values of bars. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plotbar. Optional argument.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the ohlc bars. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plotbar style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plotbar example\", overlay=true)plotbar(open, high, low, close, title='Title', color = open < close ? color.green : color.red)"
  },
  {
    "name": "plotcandle",
    "syntax": "plotcandle(open, high, low, close, title, color, wickcolor, editable, show_last, bordercolor, display, format, precision, force_overlay) → void",
    "description": "Plots candles on the chart.",
    "parameters": [
      {
        "name": "open",
        "type": "series int/float",
        "description": "Open series of data to be used as open values of candles. Required argument.",
        "required": true
      },
      {
        "name": "high",
        "type": "series int/float",
        "description": "High series of data to be used as high values of candles. Required argument.",
        "required": true
      },
      {
        "name": "low",
        "type": "series int/float",
        "description": "Low series of data to be used as low values of candles. Required argument.",
        "required": true
      },
      {
        "name": "close",
        "type": "series int/float",
        "description": "Close series of data to be used as close values of candles. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plotcandles. Optional argument.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the candles. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "wickcolor",
        "type": "series color",
        "description": "The color of the wick of candles. An optional argument.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plotcandle style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "bordercolor",
        "type": "series color",
        "description": "The border color of candles. An optional argument.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plotcandle example\", overlay=true)plotcandle(open, high, low, close, title='Title', color = open < close ? color.green : color.red, wickcolor=color.black)"
  },
  {
    "name": "plotchar",
    "syntax": "plotchar(series, title, char, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    "description": "Plots visual shapes using any given one Unicode character on the chart.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float/bool",
        "description": "Series of data to be plotted as shapes. Series is treated as a series of boolean values for all location values except location.absolute. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plot.",
        "required": false
      },
      {
        "name": "char",
        "type": "input string",
        "description": "Character to use as a visual shape.",
        "required": false
      },
      {
        "name": "location",
        "type": "input string",
        "description": "Location of shapes on the chart. Possible values are: location.abovebar, location.belowbar, location.top, location.bottom, location.absolute. Default value is location.abovebar.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the shapes. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts shapes to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "text",
        "type": "const string",
        "description": "Text to display with the shape. You can use multiline text, to separate lines use '\\n' escape sequence. Example: 'line one\\nline two'.",
        "required": false
      },
      {
        "name": "textcolor",
        "type": "series color",
        "description": "Color of the text. You can use constants like 'textcolor=color.red' or 'textcolor=#ff001a' as well as complex expressions like 'textcolor = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plotchar style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "size",
        "type": "const string",
        "description": "Size of characters on the chart. Possible values are: size.auto, size.tiny, size.small, size.normal, size.large, size.huge. Default is size.auto.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plotchar example\", overlay=true)data = close >= openplotchar(data, char='❄')"
  },
  {
    "name": "plotshape",
    "syntax": "plotshape(series, title, style, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    "description": "Plots visual shapes on the chart.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float/bool",
        "description": "Series of data to be plotted as shapes. Series is treated as a series of boolean values for all location values except location.absolute. Required argument.",
        "required": true
      },
      {
        "name": "title",
        "type": "const string",
        "description": "Title of the plot.",
        "required": false
      },
      {
        "name": "style",
        "type": "input string",
        "description": "Type of plot. Possible values are: shape.xcross, shape.cross, shape.triangleup, shape.triangledown, shape.flag, shape.circle, shape.arrowup, shape.arrowdown, shape.labelup, shape.labeldown, shape.square, shape.diamond. Default value is shape.xcross.",
        "required": false
      },
      {
        "name": "location",
        "type": "input string",
        "description": "Location of shapes on the chart. Possible values are: location.abovebar, location.belowbar, location.top, location.bottom, location.absolute. Default value is location.abovebar.",
        "required": false
      },
      {
        "name": "color",
        "type": "series color",
        "description": "Color of the shapes. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Shifts shapes to the left or to the right on the given number of bars. Default is 0.",
        "required": false
      },
      {
        "name": "text",
        "type": "const string",
        "description": "Text to display with the shape. You can use multiline text, to separate lines use '\\n' escape sequence. Example: 'line one\\nline two'.",
        "required": false
      },
      {
        "name": "textcolor",
        "type": "series color",
        "description": "Color of the text. You can use constants like 'textcolor=color.red' or 'textcolor=#ff001a' as well as complex expressions like 'textcolor = close >= open ? color.green : color.red'. Optional argument.",
        "required": false
      },
      {
        "name": "editable",
        "type": "input bool",
        "description": "If true then plotshape style will be editable in Format dialog. Default is true.",
        "required": false
      },
      {
        "name": "size",
        "type": "const string",
        "description": "Size of shapes on the chart. Possible values are: size.auto, size.tiny, size.small, size.normal, size.large, size.huge. Default is size.auto.",
        "required": false
      },
      {
        "name": "show_last",
        "type": "input int",
        "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
        "required": false
      },
      {
        "name": "display",
        "type": "input plot_display",
        "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
        "required": false
      },
      {
        "name": "format",
        "type": "input string",
        "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator(), and strategy() functions. Optional. The default is the format value used by the indicator()/strategy() function. Possible values: format.price, format.percent, format.volume.",
        "required": false
      },
      {
        "name": "precision",
        "type": "input int",
        "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator() and strategy() functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator()/strategy() function.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6indicator(\"plotshape example 1\", overlay=true)data = close >= openplotshape(data, style=shape.xcross)"
  },
  {
    "name": "polyline.delete",
    "namespace": "polyline",
    "syntax": "polyline.delete(id) → void",
    "description": "Deletes the specified polyline object. It has no effect if the id doesn't exist.",
    "parameters": [
      {
        "name": "id",
        "type": "series polyline",
        "description": "The polyline ID to delete.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "polyline.new",
    "namespace": "polyline",
    "syntax": "polyline.new(points, curved, closed, xloc, line_color, fill_color, line_style, line_width, force_overlay) → series polyline",
    "description": "Creates a new polyline instance and displays it on the chart, sequentially connecting all of the points in the points array with line segments. The segments in the drawing can be straight or curved depending on the curved parameter.",
    "parameters": [
      {
        "name": "points",
        "type": "array<chart.point>",
        "description": "An array of chart.point objects for the drawing to sequentially connect.",
        "required": false
      },
      {
        "name": "curved",
        "type": "series bool",
        "description": "If true, the drawing will connect all points from the points array using curved line segments. Optional. The default is false.",
        "required": false
      },
      {
        "name": "closed",
        "type": "series bool",
        "description": "If true, the drawing will also connect the first point to the last point from the points array, resulting in a closed polyline. Optional. The default is false.",
        "required": false
      },
      {
        "name": "xloc",
        "type": "series string",
        "description": "Determines the field of the chart.point objects in the points array that the polyline will use for its x-coordinates. If xloc.bar_index, the polyline will use the index field from each point. If xloc.bar_time, it will use the time field. Optional. The default is xloc.bar_index.",
        "required": false
      },
      {
        "name": "line_color",
        "type": "series color",
        "description": "The color of the line segments. Optional. The default is color.blue.",
        "required": false
      },
      {
        "name": "fill_color",
        "type": "series color",
        "description": "The fill color of the polyline. Optional. The default is na.",
        "required": false
      },
      {
        "name": "line_style",
        "type": "series string",
        "description": "The style of the polyline. Possible values: line.style_solid, line.style_dotted, line.style_dashed, line.style_arrow_left, line.style_arrow_right, line.style_arrow_both. Optional. The default is line.style_solid.",
        "required": false
      },
      {
        "name": "line_width",
        "type": "series int",
        "description": "The width of the line segments, expressed in pixels. Optional. The default is 1.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "series polyline",
    "example": "//@version=6indicator(\"Polylines example\", overlay = true)//@variable If `true`, connects all points in the polyline with curved line segments.bool curvedInput = input.bool(false, \"Curve Polyline\")//@variable If `true`, connects the first point in the polyline to the last point.bool closedInput = input.bool(true, \"Close Polyline\")//@variable The color of the space filled by the polyline.color fillcolor = input.color(color.new(color.blue, 90), \"Fill Color\")// Time and price inputs for the polyline's points.p1x = input.time(0,  \"p1\", confirm = true, inline = \"p1\")p1y = input.price(0, \"  \", confirm = true, inline = \"p1\")p2x = input.time(0,  \"p2\", confirm = true, inline = \"p2\")p2y = input.price(0, \"  \", confirm = true, inline = \"p2\")p3x = input.time(0,  \"p3\", confirm = true, inline = \"p3\")p3y = input.price(0, \"  \", confirm = true, inline = \"p3\")p4x = input.time(0,  \"p4\", confirm = true, inline = \"p4\")p4y = input.price(0, \"  \", confirm = true, inline = \"p4\")p5x = input.time(0,  \"p5\", confirm = true, inline = \"p5\")p5y = input.price(0, \"  \", confirm = true, inline = \"p5\")if barstate.islastconfirmedhistory    //@variable An array of `chart.point` objects for the new polyline.    var points = array.new<chart.point>()    // Push new `chart.point` instances into the `points` array.    points.push(chart.point.from_time(p1x, p1y))    points.push(chart.point.from_time(p2x, p2y))    points.push(chart.point.from_time(p3x, p3y))    points.push(chart.point.from_time(p4x, p4y))    points.push(chart.point.from_time(p5x, p5y))    // Add labels for each `chart.point` in `points`.    l1p1 = label.new(points.get(0), text = \"p1\", xloc = xloc.bar_time, color = na)    l1p2 = label.new(points.get(1), text = \"p2\", xloc = xloc.bar_time, color = na)    l2p1 = label.new(points.get(2), text = \"p3\", xloc = xloc.bar_time, color = na)    l2p2 = label.new(points.get(3), text = \"p4\", xloc = xloc.bar_time, color = na)    // Create a new polyline that connects each `chart.point` in the `points` array, starting from the first.    polyline.new(points, curved = curvedInput, closed = closedInput, fill_color = fillcolor, xloc = xloc.bar_time)"
  },
  {
    "name": "request.currency_rate",
    "namespace": "request",
    "syntax": "request.currency_rate(from, to, ignore_invalid_currency) → series float",
    "description": "Provides a daily rate that can be used to convert a value expressed in the from currency to another in the to currency.",
    "parameters": [
      {
        "name": "from",
        "type": "series string",
        "description": "The currency in which the value to be converted is expressed. Possible values: a three-letter string with the currency code in the ISO 4217 format (e.g. \"USD\"), or one of the built-in variables that return currency codes, like syminfo.currency or currency.USD.",
        "required": false
      },
      {
        "name": "to",
        "type": "series string",
        "description": "The currency in which the value is to be converted. Possible values: a three-letter string with the currency code in the ISO 4217 format (e.g. \"USD\"), or one of the built-in variables that return currency codes, like syminfo.currency or currency.USD.",
        "required": false
      },
      {
        "name": "ignore_invalid_currency",
        "type": "series bool",
        "description": "Determines the behavior of the function if a conversion rate between the two currencies cannot be calculated: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"Close in British Pounds\")rate = request.currency_rate(syminfo.currency, \"GBP\")plot(close * rate)"
  },
  {
    "name": "request.dividends",
    "namespace": "request",
    "syntax": "request.dividends(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    "description": "Requests dividends data for the specified symbol.",
    "parameters": [
      {
        "name": "ticker",
        "type": "series string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
        "required": false
      },
      {
        "name": "field",
        "type": "series string",
        "description": "Input string. Possible values include: dividends.net, dividends.gross. Default value is dividends.gross.",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "lookahead",
        "type": "simple barmerge_lookahead",
        "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
        "required": false
      },
      {
        "name": "currency",
        "type": "series string",
        "description": "Currency into which the symbol's currency-related dividends values (e.g. dividends.gross) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"request.dividends\")s1 = request.dividends(\"NASDAQ:BELFA\")plot(s1)s2 = request.dividends(\"NASDAQ:BELFA\", dividends.net, gaps=barmerge.gaps_on, lookahead=barmerge.lookahead_on)plot(s2)"
  },
  {
    "name": "request.earnings",
    "namespace": "request",
    "syntax": "request.earnings(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    "description": "Requests earnings data for the specified symbol.",
    "parameters": [
      {
        "name": "ticker",
        "type": "series string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
        "required": false
      },
      {
        "name": "field",
        "type": "series string",
        "description": "Input string. Possible values include: earnings.actual, earnings.estimate, earnings.standardized. Default value is earnings.actual.",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "lookahead",
        "type": "simple barmerge_lookahead",
        "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
        "required": false
      },
      {
        "name": "currency",
        "type": "series string",
        "description": "Currency into which the symbol's currency-related earnings values (e.g. earnings.actual) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"request.earnings\")s1 = request.earnings(\"NASDAQ:BELFA\")plot(s1)s2 = request.earnings(\"NASDAQ:BELFA\", earnings.actual, gaps=barmerge.gaps_on, lookahead=barmerge.lookahead_on)plot(s2)"
  },
  {
    "name": "request.economic",
    "namespace": "request",
    "syntax": "request.economic(country_code, field, gaps, ignore_invalid_symbol) → series float",
    "description": "Requests economic data for a symbol. Economic data includes information such as the state of a country's economy (GDP, inflation rate, etc.) or of a particular industry (steel production, ICU beds, etc.).",
    "parameters": [
      {
        "name": "country_code",
        "type": "series string",
        "description": "The code of the country (e.g. \"US\") or the region (e.g. \"EU\") for which the economic data is requested. The Help Center article lists the countries and their codes. The countries for which information is available vary with metrics. The Help Center article for each metric lists the countries for which the metric is available.",
        "required": false
      },
      {
        "name": "field",
        "type": "series string",
        "description": "The code of the requested economic metric (e.g., \"GDP\"). The Help Center article lists the metrics and their codes.",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Specifies how the returned values are merged on chart bars. Possible values: barmerge.gaps_off, barmerge.gaps_on. With barmerge.gaps_on, a value only appears on the current chart bar when it first becomes available from the function's context, otherwise na is returned (thus a \"gap\" occurs). With barmerge.gaps_off, what would otherwise be gaps are filled with the latest known value returned, avoiding na values. Optional. The default is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"US GDP\")e = request.economic(\"US\", \"GDP\")plot(e)"
  },
  {
    "name": "request.financial",
    "namespace": "request",
    "syntax": "request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency) → series float",
    "description": "Requests financial series for symbol.",
    "parameters": [
      {
        "name": "symbol",
        "type": "series string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
        "required": false
      },
      {
        "name": "financial_id",
        "type": "series string",
        "description": "Financial identifier. You can find the list of available ids via our Help Center.",
        "required": false
      },
      {
        "name": "period",
        "type": "series string",
        "description": "Reporting period. Possible values are \"TTM\", \"FY\", \"FQ\", \"FH\", \"D\".",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Merge strategy for the requested data (requested data automatically merges with the main series: OHLC data). Possible values include: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous, nearest existing values. Default value is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
        "required": false
      },
      {
        "name": "currency",
        "type": "series string",
        "description": "Optional. Currency into which the symbol's financial metrics (e.g. Net Income) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"request.financial\")f = request.financial(\"NASDAQ:MSFT\", \"ACCOUNTS_PAYABLE\", \"FY\")plot(f)"
  },
  {
    "name": "request.quandl",
    "namespace": "request",
    "syntax": "request.quandl(ticker, gaps, index, ignore_invalid_symbol) → series float",
    "description": "Note: This function has been deprecated due to the API change from NASDAQ Data Link. Requests for \"QUANDL\" symbols are no longer valid and requests for them return a runtime error.",
    "parameters": [
      {
        "name": "ticker",
        "type": "series string",
        "description": "Symbol. Note that the name of a time series and Quandl data feed should be divided by a forward slash. For example: \"CFTC/SB_FO_ALL\".",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Merge strategy for the requested data (requested data automatically merges with the main series: OHLC data). Possible values include: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous, nearest existing values. Default value is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "index",
        "type": "series int",
        "description": "A Quandl time-series column index.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"request.quandl\")f = request.quandl(\"CFTC/SB_FO_ALL\", barmerge.gaps_off, 0)plot(f)"
  },
  {
    "name": "request.security",
    "namespace": "request",
    "syntax": "request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, currency, calc_bars_count) → series <type>",
    "description": "Requests the result of an expression from a specified context (symbol and timeframe).",
    "parameters": [
      {
        "name": "symbol",
        "type": "series string",
        "description": "Symbol or ticker identifier of the requested data. Use an empty string or syminfo.tickerid to request data using the chart's symbol. To retrieve data with additional modifiers (extended sessions, dividend adjustments, non-standard chart types like Heikin Ashi and Renko, etc.), create a custom ticker ID for the request using the functions in the ticker.* namespace.",
        "required": false
      },
      {
        "name": "timeframe",
        "type": "series string",
        "description": "Timeframe of the requested data. Use an empty string or timeframe.period to request data from the chart's timeframe or the timeframe specified in the indicator() function. To request data from a different timeframe, supply a valid timeframe string. See here to learn about specifying timeframe strings.",
        "required": false
      },
      {
        "name": "expression",
        "type": "variable, function, object, array, matrix, or map of series int/float/bool/string/color/enum, or a tuple of these",
        "description": "The expression to calculate and return from the requested context. It can accept a built-in variable like close, a user-defined variable, an expression such as ta.change(close) / (high - low), a function call that does not use Pine Script® drawings, an object, a collection, or a tuple of expressions.",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Specifies how the returned values are merged on chart bars. Possible values: barmerge.gaps_on, barmerge.gaps_off. With barmerge.gaps_on a value only appears on the current chart bar when it first becomes available from the function's context, otherwise na is returned (thus a \"gap\" occurs). With barmerge.gaps_off what would otherwise be gaps are filled with the latest known value returned, avoiding na values. Optional. The default is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "lookahead",
        "type": "simple barmerge_lookahead",
        "description": "On historical bars only, returns data from the timeframe before it elapses. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Has no effect on realtime values. Optional. The default is barmerge.lookahead_off starting from Pine Script® v3. The default is barmerge.lookahead_on in v1 and v2. WARNING: Using barmerge.lookahead_on at timeframes higher than the chart's without offsetting the expression argument like in close[1] will introduce future leak in scripts, as the function will then return the close price before it is actually known in the current context. As is explained in the User Manual's page on Repainting this will produce misleading results.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      },
      {
        "name": "currency",
        "type": "series string",
        "description": "Optional. Specifies the target currency for converting values expressed in currency units (e.g., open, high, low, close) or expressions involving such values. Literal values such as 200 are not converted. The conversion rate for monetary values depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      },
      {
        "name": "calc_bars_count",
        "type": "simple int",
        "description": "Optional. Determines the maximum number of recent historical bars that the function can request. If specified, the function evaluates the expression argument starting from that number of bars behind the last historical bar in the requested dataset, treating those bars as the only available data. Limiting the number of historical bars in a request can help improve calculation efficiency in some cases. The default is the same as the number of chart bars available for the symbol and timeframe. The maximum number of bars that the function can attempt to retrieve depends on the intrabar limit of the user's plan. However, the request cannot retrieve more bars than are available in the dataset.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "example": "//@version=6indicator(\"Simple `request.security()` calls\")// Returns 1D close of the current symbol.dailyClose = request.security(syminfo.tickerid, \"1D\", close)plot(dailyClose)// Returns the close of \"AAPL\" from the same timeframe as currently open on the chart.aaplClose = request.security(\"AAPL\", timeframe.period, close)plot(aaplClose)"
  },
  {
    "name": "request.security_lower_tf",
    "namespace": "request",
    "syntax": "request.security_lower_tf(symbol, timeframe, expression, ignore_invalid_symbol, currency, ignore_invalid_timeframe, calc_bars_count) → array<type>",
    "description": "Requests the results of an expression from a specified symbol on a timeframe lower than or equal to the chart's timeframe. It returns an array containing one element for each lower-timeframe bar within the chart bar. On a 5-minute chart, requesting data using a timeframe argument of \"1\" typically returns an array with five elements representing the value of the expression on each 1-minute bar, ordered by time with the earliest value first.",
    "parameters": [
      {
        "name": "symbol",
        "type": "series string",
        "description": "Symbol or ticker identifier of the requested data. Use an empty string or syminfo.tickerid to request data using the chart's symbol. To retrieve data with additional modifiers (extended sessions, dividend adjustments, non-standard chart types like Heikin Ashi and Renko, etc.), create a custom ticker ID for the request using the functions in the ticker.* namespace.",
        "required": false
      },
      {
        "name": "timeframe",
        "type": "series string",
        "description": "Timeframe of the requested data. Use an empty string or timeframe.period to request data from the chart's timeframe or the timeframe specified in the indicator() function. To request data from a different timeframe, supply a valid timeframe string. See here to learn about specifying timeframe strings.",
        "required": false
      },
      {
        "name": "expression",
        "type": "variable, object or function of series int/float/bool/string/color/enum, or a tuple of these",
        "description": "The expression to calculate and return from the requested context. It can accept a built-in variable like close, a user-defined variable, an expression such as ta.change(close) / (high - low), a function call that does not use Pine Script® drawings, an object, or a tuple of expressions. Collections are not allowed unless they are within the fields of an object",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "series bool",
        "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      },
      {
        "name": "currency",
        "type": "series string",
        "description": "Optional. Specifies the target currency for converting values expressed in currency units (e.g., open, high, low, close) or expressions involving such values. Literal values such as 200 are not converted. The conversion rate for monetary values depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      },
      {
        "name": "ignore_invalid_timeframe",
        "type": "series bool",
        "description": "Determines the behavior of the function when the chart's timeframe is smaller than the timeframe used in the function call. If false, the script will halt and throw a runtime error. If true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      },
      {
        "name": "calc_bars_count",
        "type": "simple int",
        "description": "Optional. Determines the maximum number of recent historical bars that the function can request. If specified, the function evaluates the expression argument starting from that number of bars behind the last historical bar in the requested dataset, treating those bars as the only available data. Limiting the number of historical bars in a request can help improve calculation efficiency in some cases. The default is the same as the number of chart bars available for the symbol and timeframe. The maximum number of bars that the function can attempt to retrieve depends on the intrabar limit of the user's plan. However, the request cannot retrieve more bars than are available in the dataset.",
        "required": false
      }
    ],
    "returns": "array<type>",
    "example": "//@version=6indicator(\"`request.security_lower_tf()` Example\", overlay = true)// If the current chart timeframe is set to 120 minutes, then the `arrayClose` array will contain two 'close' values from the 60 minute timeframe for each bar.arrClose = request.security_lower_tf(syminfo.tickerid, \"60\", close)if bar_index == last_bar_index - 1    label.new(bar_index, high, str.tostring(arrClose))"
  },
  {
    "name": "request.seed",
    "namespace": "request",
    "syntax": "request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) → series <type>",
    "description": "Requests the result of an expression evaluated on data from a user-maintained GitHub repository. **Note:**The creation of new Pine Seeds repositories is suspended; only existing repositories are currently supported. See the Pine Seeds documentation on GitHub to learn more.",
    "parameters": [
      {
        "name": "source",
        "type": "series string",
        "description": "Name of the GitHub repository.",
        "required": false
      },
      {
        "name": "symbol",
        "type": "series string",
        "description": "Name of the file in the GitHub repository containing the data. The \".csv\" file extension must not be included.",
        "required": false
      },
      {
        "name": "expression",
        "type": "<arg_expr_type>",
        "description": "An expression to be calculated and returned from the requested symbol's context. It can be a built-in variable like close, an expression such as ta.sma(close, 100), a non-mutable variable previously calculated in the script, a function call that does not use Pine Script® drawings, an array, a matrix, or a tuple. Mutable variables are not allowed, unless they are enclosed in the body of a function used in the expression.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
        "required": false
      },
      {
        "name": "calc_bars_count",
        "type": "simple int",
        "description": "Optional. If specified, the function requests only this number of values from the end of the symbol's history and calculates expression as if these values are the only available data, which might improve calculation speed in some cases. The default is the same as the number of chart bars available for the symbol and timeframe. The maximum number of bars that the function can attempt to retrieve depends on the intrabar limit of the user's plan. However, the request cannot retrieve more bars than are available in the dataset.",
        "required": false
      }
    ],
    "returns": "series <type>",
    "example": "//@version=6indicator(\"BTC Development Activity\")[devAct, devActSMA] = request.seed(\"seed_crypto_santiment\", \"BTC_DEV_ACTIVITY\", [close, ta.sma(close, 10)])plot(devAct, \"BTC Development Activity\")plot(devActSMA, \"BTC Development Activity SMA10\", color = color.yellow)"
  },
  {
    "name": "request.splits",
    "namespace": "request",
    "syntax": "request.splits(ticker, field, gaps, lookahead, ignore_invalid_symbol) → series float",
    "description": "Requests splits data for the specified symbol.",
    "parameters": [
      {
        "name": "ticker",
        "type": "series string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
        "required": false
      },
      {
        "name": "field",
        "type": "series string",
        "description": "Input string. Possible values include: splits.denominator, splits.numerator.",
        "required": false
      },
      {
        "name": "gaps",
        "type": "simple barmerge_gaps",
        "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
        "required": false
      },
      {
        "name": "lookahead",
        "type": "simple barmerge_lookahead",
        "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
        "required": false
      },
      {
        "name": "ignore_invalid_symbol",
        "type": "input bool",
        "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"request.splits\")s1 = request.splits(\"NASDAQ:BELFA\", splits.denominator)plot(s1)s2 = request.splits(\"NASDAQ:BELFA\", splits.denominator, gaps=barmerge.gaps_on, lookahead=barmerge.lookahead_on)plot(s2)"
  },
  {
    "name": "runtime.error",
    "namespace": "runtime",
    "syntax": "runtime.error(message) → void",
    "description": "When called, causes a runtime error with the error message specified in the message argument.",
    "parameters": [
      {
        "name": "message",
        "type": "series string",
        "description": "Error message.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "second",
    "syntax": "second(time, timezone) → series int",
    "description": "",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "str.contains",
    "namespace": "str",
    "syntax": "str.contains(source, str) → const bool",
    "description": "Returns true if the source string contains the str substring, false otherwise.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "str",
        "type": "const string",
        "description": "The substring to search for.",
        "required": false
      }
    ],
    "returns": "const bool",
    "example": "//@version=6indicator(\"str.contains\")// If the current chart is a continuous futures chart, e.g “BTC1!”, then the function will return true, false otherwise.var isFutures = str.contains(syminfo.tickerid, \"!\")plot(isFutures ? 1 : 0)"
  },
  {
    "name": "str.endswith",
    "namespace": "str",
    "syntax": "str.endswith(source, str) → const bool",
    "description": "Returns true if the source string ends with the substring specified in str, false otherwise.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "str",
        "type": "const string",
        "description": "The substring to search for.",
        "required": false
      }
    ],
    "returns": "const bool",
    "example": ""
  },
  {
    "name": "str.format",
    "namespace": "str",
    "syntax": "str.format(formatString, arg0, arg1, ...) → simple string",
    "description": "Creates a formatted string using a specified formatting string (formatString) and one or more additional arguments (arg0, arg1, etc.). The formatting string defines the structure of the returned string, where all placeholders in curly brackets ({}) refer to the additional arguments. Each placeholder requires a number representing an argument's position, starting from 0. For instance, the placeholder {0} refers to the first argument after formatString (arg0), {1} refers to the second (arg1), and so on. The function replaces each placeholder with a string representation of the corresponding argument.",
    "parameters": [
      {
        "name": "formatString",
        "type": "simple string",
        "description": "Format string.",
        "required": false
      },
      {
        "name": "arg0",
        "type": "unknown",
        "description": "",
        "required": true
      },
      {
        "name": "arg1",
        "type": "unknown",
        "description": "",
        "required": true
      }
    ],
    "returns": "simple string",
    "flags": {
      "variadic": true,
      "minArgs": 1
    },
    "example": "//@version=6indicator(\"Simple `str.format()` demo\")//@variable A formatted string that includes representations of the current `bar_index` and `close` values.//          The placeholder `{0}` refers to the first argument after the formatting string (`bar_index`), and //          `{1}` refers to the second (`close`).string labelText = str.format(\"Current bar index: {0}\\nCurrent bar close: {1}\", bar_index, close)// Draw a label to display the `labelText` string at the current bar's `high` price. label.new(bar_index, high, labelText)"
  },
  {
    "name": "str.format_time",
    "namespace": "str",
    "syntax": "str.format_time(time, format, timezone) → series string",
    "description": "Converts the time timestamp into a string formatted according to format and timezone.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time, in milliseconds.",
        "required": false
      },
      {
        "name": "format",
        "type": "series string",
        "description": "A format string specifying the date/time representation of the time in the returned string. All letters used in the string, except those escaped by single quotation marks ', are considered formatting tokens and will be used as a formatting instruction. Refer to the Remarks section for a list of the most useful tokens. Optional. The default is \"yyyy-MM-dd'T'HH:mm:ssZ\", which represents the ISO 8601 standard.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6indicator(\"str.format_time\")if timeframe.change(\"1D\")    formattedTime = str.format_time(time, \"yyyy-MM-dd HH:mm\", syminfo.timezone)    label.new(bar_index, high, formattedTime)"
  },
  {
    "name": "str.length",
    "namespace": "str",
    "syntax": "str.length(string) → const int",
    "description": "Returns an integer corresponding to the amount of chars in that string.",
    "parameters": [
      {
        "name": "string",
        "type": "const string",
        "description": "Source string.",
        "required": false
      }
    ],
    "returns": "const int",
    "example": ""
  },
  {
    "name": "str.lower",
    "namespace": "str",
    "syntax": "str.lower(source) → const string",
    "description": "Returns a new string with all letters converted to lowercase.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "String to be converted.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": ""
  },
  {
    "name": "str.match",
    "namespace": "str",
    "syntax": "str.match(source, regex) → simple string",
    "description": "Returns the new substring of the source string if it matches a regex regular expression, an empty string otherwise.",
    "parameters": [
      {
        "name": "source",
        "type": "simple string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "regex",
        "type": "simple string",
        "description": "The regular expression to which this string is to be matched.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"str.match\")s = input.string(\"It's time to sell some NASDAQ:AAPL!\")// finding first substring that matches regular expression \"[\\w]+:[\\w]+\"var string tickerid = str.match(s, \"[\\\\w]+:[\\\\w]+\")if barstate.islastconfirmedhistory    label.new(bar_index, high, text = tickerid) // \"NASDAQ:AAPL\""
  },
  {
    "name": "str.pos",
    "namespace": "str",
    "syntax": "str.pos(source, str) → const int",
    "description": "Returns the position of the first occurrence of the str string in the source string, 'na' otherwise.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "str",
        "type": "const string",
        "description": "The substring to search for.",
        "required": false
      }
    ],
    "returns": "const int",
    "example": ""
  },
  {
    "name": "str.repeat",
    "namespace": "str",
    "syntax": "str.repeat(source, repeat, separator) → const string",
    "description": "Constructs a new string containing the source string repeated repeat times with the separator injected between each repeated instance.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "String to repeat.",
        "required": false
      },
      {
        "name": "repeat",
        "type": "const int",
        "description": "Number of times to repeat the source string. Must be greater than or equal to 0.",
        "required": false
      },
      {
        "name": "separator",
        "type": "const string",
        "description": "String to inject between repeated values. Optional. The default is empty string.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": "//@version=6indicator(\"str.repeat\")repeat = str.repeat(\"?\", 3, \",\") // Returns \"?,?,?\"label.new(bar_index,close,repeat)"
  },
  {
    "name": "str.replace",
    "namespace": "str",
    "syntax": "str.replace(source, target, replacement, occurrence) → const string",
    "description": "Returns a new string with the Nth occurrence of the target string replaced by the replacement string, where N is specified in occurrence.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "target",
        "type": "const string",
        "description": "String to be replaced.",
        "required": false
      },
      {
        "name": "replacement",
        "type": "const string",
        "description": "String to be inserted instead of the target string.",
        "required": false
      },
      {
        "name": "occurrence",
        "type": "const int",
        "description": "N-th occurrence of the target string to replace. Indexing starts at 0 for the first match. Optional. Default value is 0.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": "//@version=6indicator(\"str.replace\")var source = \"FTX:BTCUSD / FTX:BTCEUR\"// Replace first occurrence of \"FTX\" with \"BINANCE\" replacement stringvar newSource = str.replace(source, \"FTX\", \"BINANCE\", 0)if barstate.islastconfirmedhistory    // Display \"BINANCE:BTCUSD / FTX:BTCEUR\"    label.new(bar_index, high, text = newSource)"
  },
  {
    "name": "str.replace_all",
    "namespace": "str",
    "syntax": "str.replace_all(source, target, replacement) → simple string",
    "description": "Replaces each occurrence of the target string in the source string with the replacement string.",
    "parameters": [
      {
        "name": "source",
        "type": "simple string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "target",
        "type": "simple string",
        "description": "String to be replaced.",
        "required": false
      },
      {
        "name": "replacement",
        "type": "simple string",
        "description": "String to be substituted for each occurrence of target string.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": ""
  },
  {
    "name": "str.split",
    "namespace": "str",
    "syntax": "str.split(string, separator) → array<string>",
    "description": "Divides a string into an array of substrings and returns its array id.",
    "parameters": [
      {
        "name": "string",
        "type": "series string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "separator",
        "type": "series string",
        "description": "The string separating each substring.",
        "required": false
      }
    ],
    "returns": "array<string>",
    "example": ""
  },
  {
    "name": "str.startswith",
    "namespace": "str",
    "syntax": "str.startswith(source, str) → const bool",
    "description": "Returns true if the source string starts with the substring specified in str, false otherwise.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string.",
        "required": false
      },
      {
        "name": "str",
        "type": "const string",
        "description": "The substring to search for.",
        "required": false
      }
    ],
    "returns": "const bool",
    "example": ""
  },
  {
    "name": "str.substring",
    "namespace": "str",
    "syntax": "str.substring(source, begin_pos, end_pos) → const string",
    "description": "Returns a new string that is a substring of the source string. The substring begins with the character at the index specified by begin_pos and extends to 'end_pos - 1' of the source string.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "Source string from which to extract the substring.",
        "required": false
      },
      {
        "name": "begin_pos",
        "type": "const int",
        "description": "The beginning position of the extracted substring. It is inclusive (the extracted substring includes the character at that position).",
        "required": false
      },
      {
        "name": "end_pos",
        "type": "const int",
        "description": "The ending position. It is exclusive (the extracted string does NOT include that position's character). Optional. The default is the length of the source string.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": "//@version=6indicator(\"str.substring\", overlay = true)sym= input.symbol(\"NASDAQ:AAPL\")pos = str.pos(sym, \":\") // Get position of \":\" charactertkr= str.substring(sym, pos+1) // \"AAPL\"if barstate.islastconfirmedhistory    label.new(bar_index, high, text = tkr)"
  },
  {
    "name": "str.tonumber",
    "namespace": "str",
    "syntax": "str.tonumber(string) → const float",
    "description": "Converts a value represented in string to its \"float\" equivalent.",
    "parameters": [
      {
        "name": "string",
        "type": "const string",
        "description": "String containing the representation of an integer or floating point value.",
        "required": false
      }
    ],
    "returns": "const float",
    "example": ""
  },
  {
    "name": "str.tostring",
    "namespace": "str",
    "syntax": "str.tostring(value) → const string",
    "description": "",
    "parameters": [
      {
        "name": "value",
        "type": "const enum",
        "description": "Value or array ID whose elements are converted to a string.",
        "required": false
      },
      {
        "name": "format",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "const string",
    "example": ""
  },
  {
    "name": "str.trim",
    "namespace": "str",
    "syntax": "str.trim(source) → const string",
    "description": "Constructs a new string with all consecutive whitespaces and other control characters (e.g., “\\n”, “\\t”, etc.) removed from the left and right of the source.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "String to trim.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": "//@version=6indicator(\"str.trim\")trim = str.trim(\"    abc    \") // Returns \"abc\"label.new(bar_index,close,trim)"
  },
  {
    "name": "str.upper",
    "namespace": "str",
    "syntax": "str.upper(source) → const string",
    "description": "Returns a new string with all letters converted to uppercase.",
    "parameters": [
      {
        "name": "source",
        "type": "const string",
        "description": "String to be converted.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": ""
  },
  {
    "name": "strategy",
    "syntax": "strategy(title, shorttitle, overlay, format, precision, scale, pyramiding, calc_on_order_fills, calc_on_every_tick, max_bars_back, backtest_fill_limits_assumption, default_qty_type, default_qty_value, initial_capital, currency, slippage, commission_type, commission_value, process_orders_on_close, close_entries_rule, margin_long, margin_short, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, risk_free_rate, use_bar_magnifier, fill_orders_on_standard_ohlc, max_polylines_count, dynamic_requests, behind_chart) → void",
    "description": "This declaration statement designates the script as a strategy and sets a number of strategy-related properties.",
    "parameters": [
      {
        "name": "title",
        "type": "const string",
        "description": "The title of the script. It is displayed on the chart when no shorttitle argument is used, and becomes the publication's default title when publishing the script.",
        "required": false
      },
      {
        "name": "shorttitle",
        "type": "const string",
        "description": "The script's display name on charts. If specified, it will replace the title argument in most chart-related windows. Optional. The default is the argument used for title.",
        "required": false
      },
      {
        "name": "overlay",
        "type": "const bool",
        "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
        "required": false
      },
      {
        "name": "format",
        "type": "const string",
        "description": "Specifies the formatting of the script's displayed values. Possible values: format.inherit, format.price, format.volume, format.percent. Optional. The default is format.inherit.",
        "required": false
      },
      {
        "name": "precision",
        "type": "const int",
        "description": "Specifies the number of digits after the floating point of the script's displayed values. Must be a non-negative integer no greater than 16. If format is set to format.inherit and precision is specified, the format will instead be set to format.price. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is inherited from the precision of the chart's symbol.",
        "required": false
      },
      {
        "name": "scale",
        "type": "const scale_type",
        "description": "The price scale used. Possible values: scale.right, scale.left, scale.none. The scale.none value can only be applied in combination with overlay = true. Optional. By default, the script uses the same scale as the chart.",
        "required": false
      },
      {
        "name": "pyramiding",
        "type": "const int",
        "description": "The maximum number of entries allowed in the same direction. If the value is 0, only one entry order in the same direction can be opened, and additional entry orders are rejected. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "calc_on_order_fills",
        "type": "const bool",
        "description": "Specifies whether the strategy should be recalculated after an order is filled. If true, the strategy recalculates after an order is filled, as opposed to recalculating only when the bar closes. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
        "required": false
      },
      {
        "name": "calc_on_every_tick",
        "type": "const bool",
        "description": "Specifies whether the strategy should be recalculated on each realtime tick. If true, when the strategy is running on a realtime bar, it will recalculate on each chart update. If false, the strategy only calculates when the realtime bar closes. The argument used does not affect strategy calculation on historical data. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
        "required": false
      },
      {
        "name": "max_bars_back",
        "type": "const int",
        "description": "The length of the historical buffer the script keeps for every variable and function, which determines how many past values can be referenced using the [] history-referencing operator. The required buffer size is automatically detected by the Pine Script® runtime. Using this parameter is only necessary when a runtime error occurs because automatic detection fails. More information on the underlying mechanics of the historical buffer can be found in our Help Center. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "backtest_fill_limits_assumption",
        "type": "const int",
        "description": "Limit order execution threshold in ticks. When it is used, limit orders are only filled if the market price exceeds the order's limit level by the specified number of ticks. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "default_qty_type",
        "type": "const string",
        "description": "Specifies the units used for default_qty_value. Possible values are: strategy.fixed for contracts/shares/lots, strategy.cash for currency amounts, or strategy.percent_of_equity for a percentage of available equity. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is strategy.fixed.",
        "required": false
      },
      {
        "name": "default_qty_value",
        "type": "const int/float",
        "description": "The default quantity to trade, in units determined by the argument used with the default_qty_type parameter. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 1.",
        "required": false
      },
      {
        "name": "initial_capital",
        "type": "const int/float",
        "description": "The amount of funds initially available for the strategy to trade, in units of currency. Optional. The default is 1000000.",
        "required": false
      },
      {
        "name": "currency",
        "type": "const string",
        "description": "Currency used by the strategy in currency-related calculations. Market positions are still opened by converting currency into the chart symbol's currency. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
        "required": false
      },
      {
        "name": "slippage",
        "type": "const int",
        "description": "Slippage expressed in ticks. This value is added to or subtracted from the fill price of market/stop orders to make the fill price less favorable for the strategy. E.g., if syminfo.mintick is 0.01 and slippage is set to 5, a long market order will enter at 5 * 0.01 = 0.05 points above the actual price. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "commission_type",
        "type": "const string",
        "description": "Determines what the number passed to the commission_value expresses: strategy.commission.percent for a percentage of the cash volume of the order, strategy.commission.cash_per_contract for currency per contract, strategy.commission.cash_per_order for currency per order. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is strategy.commission.percent.",
        "required": false
      },
      {
        "name": "commission_value",
        "type": "const int/float",
        "description": "Commission applied to the strategy's orders in units determined by the argument passed to the commission_type parameter. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "process_orders_on_close",
        "type": "const bool",
        "description": "When set to true, generates an additional attempt to execute orders after a bar closes and strategy calculations are completed. If the orders are market orders, the broker emulator executes them before the next bar's open. If the orders are price-dependent, they will only be filled if the price conditions are met. This option is useful if you wish to close positions on the current bar. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
        "required": false
      },
      {
        "name": "close_entries_rule",
        "type": "const string",
        "description": "Determines the order in which trades are closed. Possible values are: \"FIFO\" (First-In, First-Out) if the earliest exit order must close the earliest entry order, or \"ANY\" if the orders are closed based on the from_entry parameter of the strategy.exit() function. \"FIFO\" can only be used with stocks, futures and US forex (NFA Compliance Rule 2-43b), while \"ANY\" is allowed in non-US forex. Optional. The default is \"FIFO\".",
        "required": false
      },
      {
        "name": "margin_long",
        "type": "const int/float",
        "description": "Margin long is the percentage of the purchase price of a security that must be covered by cash or collateral for long positions. Must be a non-negative number. The logic used to simulate margin calls is explained in the Help Center. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. If the value is 0, the strategy does not enforce any limits on position size. The default is 100, in which case the strategy only uses its own funds and the long positions cannot be margin called.",
        "required": false
      },
      {
        "name": "margin_short",
        "type": "const int/float",
        "description": "Margin short is the percentage of the purchase price of a security that must be covered by cash or collateral for short positions. Must be a non-negative number. The logic used to simulate margin calls is explained in the Help Center. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. If the value is 0, the strategy does not enforce any limits on position size. The default is 100, in which case the strategy only uses its own funds. Note that even with no margin used, short positions can be margin called if the loss exceeds available funds.",
        "required": false
      },
      {
        "name": "explicit_plot_zorder",
        "type": "const bool",
        "description": "Specifies the order in which the script's plots, fills, and hlines are rendered. If true, plots are drawn in the order in which they appear in the script's code, each newer plot being drawn above the previous ones. This only applies to plot*() functions, fill(), and hline(). Optional. The default is false.",
        "required": false
      },
      {
        "name": "max_lines_count",
        "type": "const int",
        "description": "The number of last line drawings displayed. Possible values: 1-500. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "max_labels_count",
        "type": "const int",
        "description": "The number of last label drawings displayed. Possible values: 1-500. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "max_boxes_count",
        "type": "const int",
        "description": "The number of last box drawings displayed. Possible values: 1-500. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "calc_bars_count",
        "type": "const int",
        "description": "Limits the initial calculation of a script to the last number of bars specified. When specified, a \"Calculated bars\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is 0, in which case the script executes on all available bars.",
        "required": false
      },
      {
        "name": "risk_free_rate",
        "type": "const int/float",
        "description": "The risk-free rate of return is the annual percentage change in the value of an investment with minimal or zero risk. It is used to calculate the Sharpe and Sortino ratios. Optional. The default is 2.",
        "required": false
      },
      {
        "name": "use_bar_magnifier",
        "type": "const bool",
        "description": "Optional. When true, the Broker Emulator uses lower timeframe data during backtesting on historical bars to achieve more realistic results. The default is false. Only Premium and higher-tier plans have access to this feature.",
        "required": false
      },
      {
        "name": "fill_orders_on_standard_ohlc",
        "type": "const bool",
        "description": "When true, forces strategies running on Heikin Ashi charts to fill orders using actual OHLC prices, for more realistic results. Optional. The default is false.",
        "required": false
      },
      {
        "name": "max_polylines_count",
        "type": "const int",
        "description": "The number of last polyline drawings displayed. Possible values: 1-100. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
        "required": false
      },
      {
        "name": "dynamic_requests",
        "type": "const bool",
        "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
        "required": false
      },
      {
        "name": "behind_chart",
        "type": "const bool",
        "description": "Optional. Controls whether all plots and drawings appear behind the chart display (if true) or in front of it (if false). This parameter only takes effect when the overlay parameter is true. The default is true.",
        "required": false
      }
    ],
    "returns": "void",
    "flags": {
      "topLevelOnly": true
    },
    "example": "//@version=6strategy(\"My strategy\", overlay = true)// Enter long by market if current open is greater than previous high.if open > high[1]    strategy.entry(\"Long\", strategy.long, 1)// Generate a full exit bracket (profit 10 points, loss 5 points per contract) from the entry named \"Long\".strategy.exit(\"Exit\", \"Long\", profit = 10, loss = 5)"
  },
  {
    "name": "strategy.cancel",
    "namespace": "strategy",
    "syntax": "strategy.cancel(id) → void",
    "description": "Cancels a pending or unfilled order with a specific identifier. If multiple unfilled orders share the same ID, calling this command with that ID as the id argument cancels all of them. If a script calls this command with an id representing the ID of a filled order, it has no effect.",
    "parameters": [
      {
        "name": "id",
        "type": "series string",
        "description": "The identifier of the unfilled order to cancel.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(title = \"Order cancellation demo\")conditionForBuy = open > high[1]if conditionForBuy    strategy.entry(\"Long\", strategy.long, 1, limit = low) // Enter long using limit order at low price of current bar if `conditionForBuy` is `true`.if not conditionForBuy    strategy.cancel(\"Long\") // Cancel the entry order with name \"Long\" if `conditionForBuy` is `false`."
  },
  {
    "name": "strategy.cancel_all",
    "namespace": "strategy",
    "syntax": "strategy.cancel_all() → void",
    "description": "Cancels all pending or unfilled orders, regardless of their identifiers.",
    "parameters": [],
    "returns": "void",
    "example": "//@version=6strategy(title = \"Cancel all orders demo\")conditionForBuy1 = open > high[1]if conditionForBuy1    strategy.entry(\"Long entry 1\", strategy.long, 1, limit = low) // Enter long using a limit order if `conditionForBuy1` is `true`.conditionForBuy2 = conditionForBuy1 and open[1] > high[2]float lowest2 = ta.lowest(low, 2)if conditionForBuy2    strategy.entry(\"Long entry 2\", strategy.long, 1, limit = lowest2) // Enter long using a limit order if `conditionForBuy2` is `true`.conditionForStopTrading = open < lowest2if conditionForStopTrading    strategy.cancel_all() // Cancel both limit orders if `conditionForStopTrading` is `true`."
  },
  {
    "name": "strategy.close",
    "namespace": "strategy",
    "syntax": "strategy.close(id, comment, qty, qty_percent, alert_message, immediately, disable_alert) → void",
    "description": "Creates an order to exit from the part of a position opened by entry orders with a specific identifier. If multiple entries in the position share the same ID, the orders from this command apply to all those entries, starting from the first open trade, when its calls use that ID as the id argument.",
    "parameters": [
      {
        "name": "id",
        "type": "series string",
        "description": "The entry identifier of the open trades to close.",
        "required": false
      },
      {
        "name": "comment",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the automatically generated exit identifier. The default is an empty string.",
        "required": false
      },
      {
        "name": "qty",
        "type": "series int/float",
        "description": "Optional. The number of contracts/lots/shares/units to close when an exit order fills. If specified, the command uses this value instead of qty_percent to determine the order size. The default is na, which means the order size depends on the qty_percent value.",
        "required": false
      },
      {
        "name": "qty_percent",
        "type": "series int/float",
        "description": "Optional. A value between 0 and 100 representing the percentage of the open trade quantity to close when an exit order fills. The percentage calculation depends on the total size of the open trades with the id entry identifier. The command ignores this parameter if the qty value is not na. The default is 100.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
        "required": false
      },
      {
        "name": "immediately",
        "type": "series bool",
        "description": "Optional. If true, the closing order executes on the same tick when the strategy places it, ignoring the strategy properties that restrict execution to the opening tick of the following bar. The default is false.",
        "required": false
      },
      {
        "name": "disable_alert",
        "type": "series bool",
        "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"Partial close strategy\")// Calculate a 14-bar and 28-bar moving average of `close` prices.float sma14 = ta.sma(close, 14)float sma28 = ta.sma(close, 28)// Place a market order to enter a long position when `sma14` crosses over `sma28`.if ta.crossover(sma14, sma28)    strategy.entry(\"My Long Entry ID\", strategy.long)// Place a market order to close the long trade when `sma14` crosses under `sma28`.if ta.crossunder(sma14, sma28)    strategy.close(\"My Long Entry ID\", \"50% market close\", qty_percent = 50)// Plot the position size.plot(strategy.position_size)"
  },
  {
    "name": "strategy.close_all",
    "namespace": "strategy",
    "syntax": "strategy.close_all(comment, alert_message, immediately, disable_alert) → void",
    "description": "Creates an order to close an open position completely, regardless of the identifiers of the entry orders that opened or added to it.",
    "parameters": [
      {
        "name": "comment",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the automatically generated exit identifier. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
        "required": false
      },
      {
        "name": "immediately",
        "type": "series bool",
        "description": "Optional. If true, the closing order executes on the same tick when the strategy places it, ignoring the strategy properties that restrict execution to the opening tick of the following bar. The default is false.",
        "required": false
      },
      {
        "name": "disable_alert",
        "type": "series bool",
        "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"Multi-entry close strategy\")// Calculate a 14-bar and 28-bar moving average of `close` prices.float sma14 = ta.sma(close, 14)float sma28 = ta.sma(close, 28)// Place a market order to enter a long trade every time `sma14` crosses over `sma28`.if ta.crossover(sma14, sma28)    strategy.order(\"My Long Entry ID \" + str.tostring(strategy.opentrades), strategy.long)// Place a market order to close the entire position every 500 bars.if bar_index % 500 == 0    strategy.close_all()// Plot the position size.plot(strategy.position_size)"
  },
  {
    "name": "strategy.closedtrades.commission",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.commission(trade_num) → series float",
    "description": "Returns the sum of entry and exit fees paid in the closed trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.closedtrades.commission` Example\", commission_type = strategy.commission.percent, commission_value = 0.1)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Plot total fees for the latest closed trade.plot(strategy.closedtrades.commission(strategy.closedtrades - 1))"
  },
  {
    "name": "strategy.closedtrades.entry_bar_index",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.entry_bar_index(trade_num) → series int",
    "description": "Returns the bar_index of the closed trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6strategy(\"strategy.closedtrades.entry_bar_index Example\")// Enter long trades on three rising bars; exit on two falling bars.if ta.rising(close, 3)    strategy.entry(\"Long\", strategy.long)if ta.falling(close, 2)    strategy.close(\"Long\")// Function that calculates the average amount of bars in a trade.avgBarsPerTrade() =>    sumBarsPerTrade = 0    for tradeNo = 0 to strategy.closedtrades - 1        // Loop through all closed trades, starting with the oldest.        sumBarsPerTrade += strategy.closedtrades.exit_bar_index(tradeNo) - strategy.closedtrades.entry_bar_index(tradeNo) + 1    result = nz(sumBarsPerTrade / strategy.closedtrades)plot(avgBarsPerTrade())"
  },
  {
    "name": "strategy.closedtrades.entry_comment",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.entry_comment(trade_num) → series string",
    "description": "Returns the comment message of the closed trade's entry, or na if there is no entry with this trade_num.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"`strategy.closedtrades.entry_comment()` Example\", overlay = true)stopPrice = open * 1.01longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    strategy.entry(\"Long\", strategy.long, stop = stopPrice, comment = str.tostring(stopPrice, \"#.####\"))    strategy.exit(\"EXIT\", trail_points = 1000, trail_offset = 0)var testTable = table.new(position.top_right, 1, 3, color.orange, border_width = 1)if barstate.islastconfirmedhistory or barstate.isrealtime    table.cell(testTable, 0, 0, 'Last closed trade:')    table.cell(testTable, 0, 1, \"Order stop price value: \" + strategy.closedtrades.entry_comment(strategy.closedtrades - 1))    table.cell(testTable, 0, 2, \"Actual Entry Price: \" + str.tostring(strategy.closedtrades.entry_price(strategy.closedtrades - 1)))"
  },
  {
    "name": "strategy.closedtrades.entry_id",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.entry_id(trade_num) → series string",
    "description": "Returns the id of the closed trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"strategy.closedtrades.entry_id Example\", overlay = true)// Enter a short position and close at the previous to last bar.if bar_index == 1    strategy.entry(\"Short at bar #\" + str.tostring(bar_index), strategy.short)if bar_index == last_bar_index - 2    strategy.close_all()// Display ID of the last entry position.if barstate.islastconfirmedhistory    label.new(last_bar_index, high, \"Last Entry ID is: \" + strategy.closedtrades.entry_id(strategy.closedtrades - 1))"
  },
  {
    "name": "strategy.closedtrades.entry_price",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.entry_price(trade_num) → series float",
    "description": "Returns the price of the closed trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"strategy.closedtrades.entry_price Example 1\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Return the entry price for the latest entry.entryPrice = strategy.closedtrades.entry_price(strategy.closedtrades - 1)plot(entryPrice, \"Long entry price\")"
  },
  {
    "name": "strategy.closedtrades.entry_time",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.entry_time(trade_num) → series int",
    "description": "Returns the UNIX time of the closed trade's entry, expressed in milliseconds..",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6strategy(\"strategy.closedtrades.entry_time Example\", overlay = true)// Enter long trades on three rising bars; exit on two falling bars.if ta.rising(close, 3)    strategy.entry(\"Long\", strategy.long)if ta.falling(close, 2)    strategy.close(\"Long\")// Calculate the average trade durationavgTradeDuration() =>    sumTradeDuration = 0    for i = 0 to strategy.closedtrades - 1        sumTradeDuration += strategy.closedtrades.exit_time(i) - strategy.closedtrades.entry_time(i)    result = nz(sumTradeDuration / strategy.closedtrades)// Display average duration converted to seconds and formatted using 2 decimal pointsif barstate.islastconfirmedhistory    label.new(bar_index, high, str.tostring(avgTradeDuration() / 1000, \"#.##\") + \" seconds\")"
  },
  {
    "name": "strategy.closedtrades.exit_bar_index",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.exit_bar_index(trade_num) → series int",
    "description": "Returns the bar_index of the closed trade's exit.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6strategy(\"strategy.closedtrades.exit_bar_index Example 1\")// Strategy calls to place a single short trade. We enter the trade at the first bar and exit the trade at 10 bars before the last chart bar.if bar_index == 0    strategy.entry(\"Short\", strategy.short)if bar_index == last_bar_index - 10    strategy.close(\"Short\")// Calculate the amount of bars since the last closed trade.barsSinceClosed = strategy.closedtrades > 0 ? bar_index - strategy.closedtrades.exit_bar_index(strategy.closedtrades - 1) : naplot(barsSinceClosed, \"Bars since last closed trade\")"
  },
  {
    "name": "strategy.closedtrades.exit_comment",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.exit_comment(trade_num) → series string",
    "description": "Returns the comment message of the closed trade's exit, or na if there is no entry with this trade_num.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"`strategy.closedtrades.exit_comment()` Example\", overlay = true)longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    strategy.entry(\"Long\", strategy.long)    strategy.exit(\"Exit\", stop = open * 0.95, limit = close * 1.05, trail_points = 100, trail_offset = 0, comment_profit = \"TP\", comment_loss = \"SL\", comment_trailing = \"TRAIL\")exitStats() =>    int slCount = 0    int tpCount = 0    int trailCount = 0    if strategy.closedtrades > 0        for i = 0 to strategy.closedtrades - 1            switch strategy.closedtrades.exit_comment(i)                \"TP\"    => tpCount    += 1                \"SL\"    => slCount    += 1                \"TRAIL\" => trailCount += 1    [slCount, tpCount, trailCount]var testTable = table.new(position.top_right, 1, 4, color.orange, border_width = 1)if barstate.islastconfirmedhistory    [slCount, tpCount, trailCount] = exitStats()    table.cell(testTable, 0, 0, \"Closed trades (\" + str.tostring(strategy.closedtrades) +\") stats:\")    table.cell(testTable, 0, 1, \"Stop Loss: \" + str.tostring(slCount))    table.cell(testTable, 0, 2, \"Take Profit: \" + str.tostring(tpCount))    table.cell(testTable, 0, 3, \"Trailing Stop: \" + str.tostring(trailCount))"
  },
  {
    "name": "strategy.closedtrades.exit_id",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.exit_id(trade_num) → series string",
    "description": "Returns the id of the closed trade's exit.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"strategy.closedtrades.exit_id Example\", overlay = true)// Strategy calls to create single short and long tradesif bar_index == last_bar_index - 15    strategy.entry(\"Long Entry\", strategy.long)else if bar_index == last_bar_index - 10    strategy.entry(\"Short Entry\", strategy.short)// When a new open trade is detected then we create the exit strategy corresponding with the matching entry id// We detect the correct entry id by determining if a position is long or short based on the position quantityif ta.change(strategy.opentrades) != 0    posSign = strategy.opentrades.size(strategy.opentrades - 1)    strategy.exit(posSign > 0 ? \"SL Long Exit\" : \"SL Short Exit\", strategy.opentrades.entry_id(strategy.opentrades - 1), stop = posSign > 0 ? high - ta.tr : low + ta.tr)// When a new closed trade is detected then we place a label above the bar with the exit infoif ta.change(strategy.closedtrades) != 0    msg = \"Trade closed by: \" + strategy.closedtrades.exit_id(strategy.closedtrades - 1)    label.new(bar_index, high + (3 * ta.tr), msg)"
  },
  {
    "name": "strategy.closedtrades.exit_price",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.exit_price(trade_num) → series float",
    "description": "Returns the price of the closed trade's exit.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"strategy.closedtrades.exit_price Example 1\")// We are creating a long trade every 5 barsif bar_index % 5 == 0    strategy.entry(\"Long\", strategy.long)strategy.close(\"Long\")// Return the exit price from the latest closed trade.exitPrice = strategy.closedtrades.exit_price(strategy.closedtrades - 1)plot(exitPrice, \"Long exit price\")"
  },
  {
    "name": "strategy.closedtrades.exit_time",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.exit_time(trade_num) → series int",
    "description": "Returns the UNIX time of the closed trade's exit, expressed in milliseconds.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6strategy(\"strategy.closedtrades.exit_time Example 1\")// Enter long trades on three rising bars; exit on two falling bars.if ta.rising(close, 3)    strategy.entry(\"Long\", strategy.long)if ta.falling(close, 2)    strategy.close(\"Long\")// Calculate the average trade duration.avgTradeDuration() =>    sumTradeDuration = 0    for i = 0 to strategy.closedtrades - 1        sumTradeDuration += strategy.closedtrades.exit_time(i) - strategy.closedtrades.entry_time(i)    result = nz(sumTradeDuration / strategy.closedtrades)// Display average duration converted to seconds and formatted using 2 decimal points.if barstate.islastconfirmedhistory    label.new(bar_index, high, str.tostring(avgTradeDuration() / 1000, \"#.##\") + \" seconds\")"
  },
  {
    "name": "strategy.closedtrades.max_drawdown",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.max_drawdown(trade_num) → series float",
    "description": "Returns the maximum drawdown of the closed trade, i.e., the maximum possible loss during the trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.closedtrades.max_drawdown` Example\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Get the biggest max trade drawdown value from all of the closed trades.maxTradeDrawDown() =>    maxDrawdown = 0.0    for tradeNo = 0 to strategy.closedtrades - 1        maxDrawdown := math.max(maxDrawdown, strategy.closedtrades.max_drawdown(tradeNo))    result = maxDrawdownplot(maxTradeDrawDown(), \"Biggest max drawdown\")"
  },
  {
    "name": "strategy.closedtrades.max_drawdown_percent",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.max_drawdown_percent(trade_num) → series float",
    "description": "Returns the maximum drawdown of the closed trade, i.e., the maximum possible loss during the trade, expressed as a percentage and calculated by formula: Lowest Value During Trade / (Entry Price x Quantity) * 100.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.closedtrades.max_runup",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.max_runup(trade_num) → series float",
    "description": "Returns the maximum run up of the closed trade, i.e., the maximum possible profit during the trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.closedtrades.max_runup` Example\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Get the biggest max trade runup value from all of the closed trades.maxTradeRunUp() =>    maxRunup = 0.0    for tradeNo = 0 to strategy.closedtrades - 1        maxRunup := math.max(maxRunup, strategy.closedtrades.max_runup(tradeNo))    result = maxRunupplot(maxTradeRunUp(), \"Max trade runup\")"
  },
  {
    "name": "strategy.closedtrades.max_runup_percent",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.max_runup_percent(trade_num) → series float",
    "description": "Returns the maximum run-up of the closed trade, i.e., the maximum possible profit during the trade, expressed as a percentage and calculated by formula: Highest Value During Trade / (Entry Price x Quantity) * 100.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.closedtrades.profit",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.profit(trade_num) → series float",
    "description": "Returns the profit/loss of the closed trade in the strategy's account currency, reduced by the trade's commissions. A positive returned value represents a profit, and a negative value represents a loss.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.closedtrades.profit()` example\")// Enter a long trade every 15 bars, and close a long trade every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")//@function Calculates the average gross profit from all available closed trades. avgGrossProfit() =>    var float result = 0.0    if result == 0.0 or strategy.closedtrades > strategy.closedtrades[1]        float sumGrossProfit = 0.0        for tradeNo = 0 to strategy.closedtrades - 1            sumGrossProfit += strategy.closedtrades.profit(tradeNo)        result := nz(sumGrossProfit / strategy.closedtrades)    resultplot(avgGrossProfit(), \"Average gross profit\")"
  },
  {
    "name": "strategy.closedtrades.profit_percent",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.profit_percent(trade_num) → series float",
    "description": "Returns the profit/loss value of the closed trade, expressed as a percentage. Losses are expressed as negative values.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.closedtrades.size",
    "namespace": "strategy",
    "syntax": "strategy.closedtrades.size(trade_num) → series float",
    "description": "Returns the direction and the number of contracts traded in the closed trade. If the value is > 0, the market position was long. If the value is < 0, the market position was short.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.closedtrades.size` Example 1\")// We calculate the max amt of shares we can buy.amtShares = math.floor(strategy.equity / close)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 barsif bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long, qty = amtShares)if bar_index % 20 == 0    strategy.close(\"Long\")// Plot the number of contracts traded in the last closed trade.plot(strategy.closedtrades.size(strategy.closedtrades - 1), \"Number of contracts traded\")"
  },
  {
    "name": "strategy.convert_to_account",
    "namespace": "strategy",
    "syntax": "strategy.convert_to_account(value) → series float",
    "description": "Converts the value from the currency that the symbol on the chart is traded in (syminfo.currency) to the currency used by the strategy (strategy.account_currency).",
    "parameters": [
      {
        "name": "value",
        "type": "series int/float",
        "description": "The value to be converted.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.convert_to_account` Example 1\", currency = currency.EUR)plot(close, \"Close price using default currency\")plot(strategy.convert_to_account(close), \"Close price converted to strategy currency\")"
  },
  {
    "name": "strategy.convert_to_symbol",
    "namespace": "strategy",
    "syntax": "strategy.convert_to_symbol(value) → series float",
    "description": "Converts the value from the currency used by the strategy (strategy.account_currency) to the currency that the symbol on the chart is traded in (syminfo.currency).",
    "parameters": [
      {
        "name": "value",
        "type": "series int/float",
        "description": "The value to be converted.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.convert_to_symbol` Example\", currency = currency.EUR)// Calculate the max qty we can buy using current chart's currency.calcContracts(accountMoney) =>    math.floor(strategy.convert_to_symbol(accountMoney) / syminfo.pointvalue / close)// Return max qty we can buy using 300 eurosqt = calcContracts(300)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars using our custom qty.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long, qty = qt)if bar_index % 20 == 0    strategy.close(\"Long\")"
  },
  {
    "name": "strategy.default_entry_qty",
    "namespace": "strategy",
    "syntax": "strategy.default_entry_qty(fill_price) → series float",
    "description": "Calculates the default quantity, in units, of an entry order from strategy.entry() or strategy.order() if it were to fill at the specified fill_price value. The calculation depends on several strategy properties, including default_qty_type, default_qty_value, currency, and other parameters in the strategy() function and their representation in the \"Properties\" tab of the strategy's settings.",
    "parameters": [
      {
        "name": "fill_price",
        "type": "series int/float",
        "description": "The fill price for which to calculate the default order quantity.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"Supertrend Strategy\", overlay = true, default_qty_type = strategy.percent_of_equity, default_qty_value = 15)//@variable The length of the ATR calculation.atrPeriod = input(10, \"ATR Length\")//@variable The ATR multiplier.factor = input.float(3.0, \"Factor\", step = 0.01)//@variable The tick offset of the stop order.stopOffsetInput = input.int(100, \"Tick offset for entry stop\")// Get the direction of the SuperTrend.[_, direction] = ta.supertrend(factor, atrPeriod)if ta.change(direction) < 0    //@variable The stop price of the entry order.    stopPrice = close + syminfo.mintick * stopOffsetInput    //@variable The expected default fill quantity at the `stopPrice`. This value may not reflect actual qty of the filled order, because fill price may be different.    calculatedQty = strategy.default_entry_qty(stopPrice)    strategy.entry(\"My Long Entry Id\", strategy.long, stop = stopPrice)    label.new(bar_index, stopPrice, str.format(\"Stop set at {0}\\nExpected qty at {0}: {1}\", math.round_to_mintick(stopPrice), calculatedQty))if ta.change(direction) > 0    strategy.close_all()"
  },
  {
    "name": "strategy.entry",
    "namespace": "strategy",
    "syntax": "strategy.entry(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    "description": "Creates a new order to open or add to a position. If an unfilled order with the same id exists, a call to this command modifies that order.",
    "parameters": [
      {
        "name": "id",
        "type": "series string",
        "description": "The identifier of the order, which corresponds to an entry ID in the strategy's trades after the order fills. If the strategy opens a new position after filling the order, the order's ID becomes the strategy.position_entry_name value. Strategy commands can reference the order ID to cancel or modify pending orders and generate exit orders for specific open trades. The Strategy Tester and the chart display the order ID unless the command specifies a comment value.",
        "required": false
      },
      {
        "name": "direction",
        "type": "series strategy_direction",
        "description": "The direction of the trade. Possible values: strategy.long for a long trade, strategy.short for a short one.",
        "required": false
      },
      {
        "name": "qty",
        "type": "series int/float",
        "description": "Optional. The number of contracts/shares/lots/units in the resulting open trade when the order fills. The default is na, which means that the command uses the default_qty_type and default_qty_value parameters of the strategy() declaration statement to determine the quantity.",
        "required": false
      },
      {
        "name": "limit",
        "type": "series int/float",
        "description": "Optional. The limit price of the order. If specified, the command creates a limit or stop-limit order, depending on whether the stop value is also specified. The default is na, which means the resulting order is not of the limit or stop-limit type.",
        "required": false
      },
      {
        "name": "stop",
        "type": "series int/float",
        "description": "Optional. The stop price of the order. If specified, the command creates a stop or stop-limit order, depending on whether the limit value is also specified. The default is na, which means the resulting order is not of the stop or stop-limit type.",
        "required": false
      },
      {
        "name": "oca_name",
        "type": "series string",
        "description": "Optional. The name of the order's One-Cancels-All (OCA) group. When a pending order with the same oca_name and oca_type parameters executes, that order affects all unfilled orders in the group. The default is an empty string, which means the order does not belong to an OCA group.",
        "required": false
      },
      {
        "name": "oca_type",
        "type": "input string",
        "description": "Optional. Specifies how an unfilled order behaves when another pending order with the same oca_name and oca_type values executes. Possible values: strategy.oca.cancel, strategy.oca.reduce, strategy.oca.none. The default is strategy.oca.none.",
        "required": false
      },
      {
        "name": "comment",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
        "required": false
      },
      {
        "name": "disable_alert",
        "type": "series bool",
        "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"Market order strategy\", overlay = true)// Calculate a 14-bar and 28-bar moving average of `close` prices.float sma14 = ta.sma(close, 14)float sma28 = ta.sma(close, 28)// Place a market order to close the short trade and enter a long position when `sma14` crosses over `sma28`.if ta.crossover(sma14, sma28)    strategy.entry(\"My Long Entry ID\", strategy.long)// Place a market order to close the long trade and enter a short position when `sma14` crosses under `sma28`.if ta.crossunder(sma14, sma28)    strategy.entry(\"My Short Entry ID\", strategy.short)"
  },
  {
    "name": "strategy.exit",
    "namespace": "strategy",
    "syntax": "strategy.exit(id, from_entry, qty, qty_percent, profit, limit, loss, stop, trail_price, trail_points, trail_offset, oca_name, comment, comment_profit, comment_loss, comment_trailing, alert_message, alert_profit, alert_loss, alert_trailing, disable_alert) → void",
    "description": "Creates price-based orders to exit from an open position. If unfilled exit orders with the same id exist, calls to this command modify those orders. This command can generate more than one type of exit order, depending on the specified parameters. However, it does not create market orders. To exit from a position with a market order, use strategy.close() or strategy.close_all().",
    "parameters": [
      {
        "name": "id",
        "type": "series string",
        "description": "The identifier of the orders, which corresponds to an exit ID in the strategy's trades after an order fills. Strategy commands can reference the order ID to cancel or modify pending exit orders. The Strategy Tester and the chart display the order ID unless the command includes a comment* argument that applies to the filled order.",
        "required": false
      },
      {
        "name": "from_entry",
        "type": "series string",
        "description": "Optional. The entry order ID of the trade to exit from. If there is more than one open trade with the specified entry ID, the command generates exit orders for all the entries from before or at the time of the call. The default is an empty string, which means the command generates exit orders for all open trades until the position closes.",
        "required": false
      },
      {
        "name": "qty",
        "type": "series int/float",
        "description": "Optional. The number of contracts/lots/shares/units to close when an exit order fills. If specified, the command uses this value instead of qty_percent to determine the order size. The exit orders reserve this quantity from the position, meaning other calls to this command cannot close this portion until the strategy fills or cancels those orders. The default is na, which means the order size depends on the qty_percent value.",
        "required": false
      },
      {
        "name": "qty_percent",
        "type": "series int/float",
        "description": "Optional. A value between 0 and 100 representing the percentage of the open trade quantity to close when an exit order fills. The exit orders reserve this percentage from the applicable open trades, meaning other calls to this command cannot close this portion until the strategy fills or cancels those orders. The percentage calculation depends on the total size of the applicable open trades without considering the reserved amount from other strategy.exit() calls. The command ignores this parameter if the qty value is not na. The default is 100.",
        "required": false
      },
      {
        "name": "profit",
        "type": "series int/float",
        "description": "Optional. The take-profit distance, expressed in ticks. If specified, the command creates a limit order to exit the trade profit ticks away from the entry price in the favorable direction. The order executes at the calculated price or a better value. If this parameter and limit are not na, the command places a take-profit order only at the price level expected to trigger an exit first. The default is na.",
        "required": false
      },
      {
        "name": "limit",
        "type": "series int/float",
        "description": "Optional. The take-profit price. If this parameter and profit are not na, the command places a take-profit order only at the price level expected to trigger an exit first. The default is na.",
        "required": false
      },
      {
        "name": "loss",
        "type": "series int/float",
        "description": "Optional. The stop-loss distance, expressed in ticks. If specified, the command creates a stop order to exit the trade loss ticks away from the entry price in the unfavorable direction. The order executes at the calculated price or a worse value. If this parameter and stop are not na, the command places a stop-loss order only at the price level expected to trigger an exit first. The default is na.",
        "required": false
      },
      {
        "name": "stop",
        "type": "series int/float",
        "description": "Optional. The stop-loss price. If this parameter and loss are not na, the command places a stop-loss order only at the price level expected to trigger an exit first. The default is na.",
        "required": false
      },
      {
        "name": "trail_price",
        "type": "series int/float",
        "description": "Optional. The price of the trailing stop activation level. If the value is more favorable than the entry price, the command creates a trailing stop when the market price reaches that value. If less favorable than the entry price, the command creates the trailing stop immediately when the current market price is equal to or more favorable than the value. If this parameter and trail_points are not na, the command sets the activation level using the value expected to activate the stop first. The default is na.",
        "required": false
      },
      {
        "name": "trail_points",
        "type": "series int/float",
        "description": "Optional. The trailing stop activation distance, expressed in ticks. If the value is positive, the command creates a trailing stop order when the market price moves trail_points ticks away from the trade's entry price in the favorable direction. If the value is negative, the command creates the trailing stop immediately when the market price is equal to or more favorable than the level trail_points ticks away from the entry price in the unfavorable direction. The default is na.",
        "required": false
      },
      {
        "name": "trail_offset",
        "type": "series int/float",
        "description": "Optional. The trailing stop offset. When the market price reaches the activation level determined by the trail_price or trail_points parameter, or exceeds the level in the favorable direction, the command creates a trailing stop with an initial value trail_offset ticks away from that level in the unfavorable direction. After activation, the trailing stop moves toward the market price each time the trade's profit reaches a better value, maintaining the specified distance behind the best price. The default is na.",
        "required": false
      },
      {
        "name": "oca_name",
        "type": "series string",
        "description": "Optional. The name of the One-Cancels-All (OCA) group that the command's take-profit, stop-loss, and trailing stop orders belong to. All orders from this command are of the strategy.oca.reduce OCA type. When an order of this OCA type with the same oca_name executes, the strategy reduces the sizes of other unfilled orders in the OCA group by the filled quantity. The default is an empty string, which means the strategy assigns the OCA name automatically, and the resulting orders cannot reduce or be reduced by the orders from other commands.",
        "required": false
      },
      {
        "name": "comment",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The command ignores this value if the call includes an argument for a comment_* parameter that applies to the order. The default is an empty string.",
        "required": false
      },
      {
        "name": "comment_profit",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's take-profit orders created using the profit or limit parameter. The default is an empty string.",
        "required": false
      },
      {
        "name": "comment_loss",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's stop-loss orders created using the loss or stop parameter. The default is an empty string.",
        "required": false
      },
      {
        "name": "comment_trailing",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's trailing stop orders created using the trail_price or trail_points and trail_offset parameters. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The command ignores this value if the call includes an argument for the other alert_* parameter that applies to the order. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_profit",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's take-profit orders created using the profit or limit parameter. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_loss",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's stop-loss orders created using the loss or stop parameter. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_trailing",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's trailing stop orders created using the trail_price or trail_points and trail_offset parameters. The default is an empty string.",
        "required": false
      },
      {
        "name": "disable_alert",
        "type": "series bool",
        "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"Exit bracket strategy\", overlay = true)// Inputs that define the profit and loss amount of each trade as a tick distance from the entry price.int profitDistanceInput = input.int(100, \"Profit distance, in ticks\", 1)int lossDistanceInput   = input.int(100, \"Loss distance, in ticks\", 1)// Variables to track the take-profit and stop-loss price.var float takeProfit = navar float stopLoss   = na// Calculate a 14-bar and 28-bar moving average of `close` prices.float sma14 = ta.sma(close, 14)float sma28 = ta.sma(close, 28)if ta.crossover(sma14, sma28) and strategy.opentrades == 0    // Place a market order to enter a long position.    strategy.entry(\"My Long Entry ID\", strategy.long)    // Place a take-profit and stop-loss order when the entry order fills.    strategy.exit(\"My Long Exit ID\", \"My Long Entry ID\", profit = profitDistanceInput, loss = lossDistanceInput)if ta.change(strategy.opentrades) == 1    //@variable The long entry price.    float entryPrice = strategy.opentrades.entry_price(0)    // Update the `takeProfit` and `stopLoss` values.    takeProfit := entryPrice + profitDistanceInput * syminfo.mintick    stopLoss   := entryPrice - lossDistanceInput * syminfo.mintickif ta.change(strategy.closedtrades) == 1    // Reset the `takeProfit` and `stopLoss`.    takeProfit := na    stopLoss   := na// Plot the `takeProfit` and `stopLoss`.plot(takeProfit, \"Take-profit level\", color.green, 2, plot.style_linebr)plot(stopLoss, \"Stop-loss level\", color.red, 2, plot.style_linebr)"
  },
  {
    "name": "strategy.opentrades.commission",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.commission(trade_num) → series float",
    "description": "Returns the sum of entry and exit fees paid in the open trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "// Calculates the gross profit or loss for the current open position.//@version=6strategy(\"`strategy.opentrades.commission` Example\", commission_type = strategy.commission.percent, commission_value = 0.1)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Calculate gross profit or loss for open positions only.tradeOpenGrossPL() =>    sumOpenGrossPL = 0.0    for tradeNo = 0 to strategy.opentrades - 1        sumOpenGrossPL += strategy.opentrades.profit(tradeNo) - strategy.opentrades.commission(tradeNo)    result = sumOpenGrossPLplot(tradeOpenGrossPL())"
  },
  {
    "name": "strategy.opentrades.entry_bar_index",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.entry_bar_index(trade_num) → series int",
    "description": "Returns the bar_index of the open trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "// Wait 10 bars and then close the position.//@version=6strategy(\"`strategy.opentrades.entry_bar_index` Example\")barsSinceLastEntry() =>    strategy.opentrades > 0 ? bar_index - strategy.opentrades.entry_bar_index(strategy.opentrades - 1) : na// Enter a long position if there are no open positions.if strategy.opentrades == 0    strategy.entry(\"Long\", strategy.long)// Close the long position after 10 bars.if barsSinceLastEntry() >= 10    strategy.close(\"Long\")"
  },
  {
    "name": "strategy.opentrades.entry_comment",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.entry_comment(trade_num) → series string",
    "description": "Returns the comment message of the open trade's entry, or na if there is no entry with this trade_num.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"`strategy.opentrades.entry_comment()` Example\", overlay = true)stopPrice = open * 1.01longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))if (longCondition)    strategy.entry(\"Long\", strategy.long, stop = stopPrice, comment = str.tostring(stopPrice, \"#.####\"))var testTable = table.new(position.top_right, 1, 3, color.orange, border_width = 1)if barstate.islastconfirmedhistory or barstate.isrealtime    table.cell(testTable, 0, 0, 'Last entry stats')    table.cell(testTable, 0, 1, \"Order stop price value: \" + strategy.opentrades.entry_comment(strategy.opentrades - 1))    table.cell(testTable, 0, 2, \"Actual Entry Price: \" + str.tostring(strategy.opentrades.entry_price(strategy.opentrades - 1)))"
  },
  {
    "name": "strategy.opentrades.entry_id",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.entry_id(trade_num) → series string",
    "description": "Returns the id of the open trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series string",
    "example": "//@version=6strategy(\"`strategy.opentrades.entry_id` Example\", overlay = true)// We enter a long position when 14 period sma crosses over 28 period sma.// We enter a short position when 14 period sma crosses under 28 period sma.longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))shortCondition = ta.crossunder(ta.sma(close, 14), ta.sma(close, 28))// Strategy calls to enter a long or short position when the corresponding condition is met.if longCondition    strategy.entry(\"Long entry at bar #\" + str.tostring(bar_index), strategy.long)if shortCondition    strategy.entry(\"Short entry at bar #\" + str.tostring(bar_index), strategy.short)// Display ID of the latest open position.if barstate.islastconfirmedhistory    label.new(bar_index, high + (2 * ta.tr), \"Last opened position is \\n \" + strategy.opentrades.entry_id(strategy.opentrades - 1))"
  },
  {
    "name": "strategy.opentrades.entry_price",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.entry_price(trade_num) → series float",
    "description": "Returns the price of the open trade's entry.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"strategy.opentrades.entry_price Example 1\", overlay = true)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if ta.crossover(close, ta.sma(close, 14))    strategy.entry(\"Long\", strategy.long)// Return the entry price for the latest closed trade.currEntryPrice = strategy.opentrades.entry_price(strategy.opentrades - 1)currExitPrice = currEntryPrice * 1.05if high >= currExitPrice    strategy.close(\"Long\")plot(currEntryPrice, \"Long entry price\", style = plot.style_linebr)plot(currExitPrice, \"Long exit price\", color.green, style = plot.style_linebr)"
  },
  {
    "name": "strategy.opentrades.entry_time",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.entry_time(trade_num) → series int",
    "description": "Returns the UNIX time of the open trade's entry, expressed in milliseconds.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6strategy(\"strategy.opentrades.entry_time Example\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Calculates duration in milliseconds since the last position was opened.timeSinceLastEntry()=>    strategy.opentrades > 0 ? (time - strategy.opentrades.entry_time(strategy.opentrades - 1)) : naplot(timeSinceLastEntry() / 1000 * 60 * 60 * 24, \"Days since last entry\")"
  },
  {
    "name": "strategy.opentrades.max_drawdown",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.max_drawdown(trade_num) → series float",
    "description": "Returns the maximum drawdown of the open trade, i.e., the maximum possible loss during the trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"strategy.opentrades.max_drawdown Example 1\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Plot the max drawdown of the latest open trade.plot(strategy.opentrades.max_drawdown(strategy.opentrades - 1), \"Max drawdown of the latest open trade\")"
  },
  {
    "name": "strategy.opentrades.max_drawdown_percent",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.max_drawdown_percent(trade_num) → series float",
    "description": "Returns the maximum drawdown of the open trade, i.e., the maximum possible loss during the trade, expressed as a percentage and calculated by formula: Lowest Value During Trade / (Entry Price x Quantity) * 100.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.opentrades.max_runup",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.max_runup(trade_num) → series float",
    "description": "Returns the maximum run up of the open trade, i.e., the maximum possible profit during the trade, expressed in strategy.account_currency.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"strategy.opentrades.max_runup Example 1\")// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")// Plot the max runup of the latest open trade.plot(strategy.opentrades.max_runup(strategy.opentrades - 1), \"Max runup of the latest open trade\")"
  },
  {
    "name": "strategy.opentrades.max_runup_percent",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.max_runup_percent(trade_num) → series float",
    "description": "Returns the maximum run-up of the open trade, i.e., the maximum possible profit during the trade, expressed as a percentage and calculated by formula: Highest Value During Trade / (Entry Price x Quantity) * 100.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.opentrades.profit",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.profit(trade_num) → series float",
    "description": "Returns the profit/loss of the open trade, expressed in strategy.account_currency. Losses are expressed as negative values.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "// Returns the profit of the last open trade.//@version=6strategy(\"`strategy.opentrades.profit` Example 1\", commission_type = strategy.commission.percent, commission_value = 0.1)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 bars.if bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long)if bar_index % 20 == 0    strategy.close(\"Long\")plot(strategy.opentrades.profit(strategy.opentrades - 1), \"Profit of the latest open trade\")"
  },
  {
    "name": "strategy.opentrades.profit_percent",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.profit_percent(trade_num) → series float",
    "description": "Returns the profit/loss of the open trade, expressed as a percentage. Losses are expressed as negative values.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the closed trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "strategy.opentrades.size",
    "namespace": "strategy",
    "syntax": "strategy.opentrades.size(trade_num) → series float",
    "description": "Returns the direction and the number of contracts traded in the open trade. If the value is > 0, the market position was long. If the value is < 0, the market position was short.",
    "parameters": [
      {
        "name": "trade_num",
        "type": "series int",
        "description": "The trade number of the open trade. The number of the first trade is zero.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6strategy(\"`strategy.opentrades.size` Example 1\")// We calculate the max amt of shares we can buy.amtShares = math.floor(strategy.equity / close)// Strategy calls to enter long trades every 15 bars and exit long trades every 20 barsif bar_index % 15 == 0    strategy.entry(\"Long\", strategy.long, qty = amtShares)if bar_index % 20 == 0    strategy.close(\"Long\")// Plot the number of contracts in the latest open trade.plot(strategy.opentrades.size(strategy.opentrades - 1), \"Amount of contracts in latest open trade\")"
  },
  {
    "name": "strategy.order",
    "namespace": "strategy",
    "syntax": "strategy.order(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    "description": "Creates a new order to open, add to, or exit from a position. If an unfilled order with the same id exists, a call to this command modifies that order.",
    "parameters": [
      {
        "name": "id",
        "type": "series string",
        "description": "The identifier of the order, which corresponds to an entry or exit ID in the strategy's trades after the order fills. If the strategy opens a new position after filling the order, the order's ID becomes the strategy.position_entry_name value. Strategy commands can reference the order ID to cancel or modify pending orders and generate exit orders for specific open trades. The Strategy Tester and the chart display the order ID unless the command specifies a comment value.",
        "required": false
      },
      {
        "name": "direction",
        "type": "series strategy_direction",
        "description": "The direction of the trade. Possible values: strategy.long for a long trade, strategy.short for a short one.",
        "required": false
      },
      {
        "name": "qty",
        "type": "series int/float",
        "description": "Optional. The number of contracts/shares/lots/units to trade when the order fills. The default is na, which means that the command uses the default_qty_type and default_qty_value parameters of the strategy() declaration statement to determine the quantity.",
        "required": false
      },
      {
        "name": "limit",
        "type": "series int/float",
        "description": "Optional. The limit price of the order. If specified, the command creates a limit or stop-limit order, depending on whether the stop value is also specified. The default is na, which means the resulting order is not of the limit or stop-limit type.",
        "required": false
      },
      {
        "name": "stop",
        "type": "series int/float",
        "description": "Optional. The stop price of the order. If specified, the command creates a stop or stop-limit order, depending on whether the limit value is also specified. The default is na, which means the resulting order is not of the stop or stop-limit type.",
        "required": false
      },
      {
        "name": "oca_name",
        "type": "series string",
        "description": "Optional. The name of the order's One-Cancels-All (OCA) group. When a pending order with the same oca_name and oca_type parameters executes, that order affects all unfilled orders in the group. The default is an empty string, which means the order does not belong to an OCA group.",
        "required": false
      },
      {
        "name": "oca_type",
        "type": "input string",
        "description": "Optional. Specifies how an unfilled order behaves when another pending order with the same oca_name and oca_type values executes. Possible values: strategy.oca.cancel, strategy.oca.reduce, strategy.oca.none. The default is strategy.oca.none.",
        "required": false
      },
      {
        "name": "comment",
        "type": "series string",
        "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The default is an empty string.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "series string",
        "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
        "required": false
      },
      {
        "name": "disable_alert",
        "type": "series bool",
        "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"Market order strategy\", overlay = true)// Calculate a 14-bar and 28-bar moving average of `close` prices.float sma14 = ta.sma(close, 14)float sma28 = ta.sma(close, 28)// Place a market order to enter a long position when `sma14` crosses over `sma28`.if ta.crossover(sma14, sma28) and strategy.position_size == 0    strategy.order(\"My Long Entry ID\", strategy.long)// Place a market order to sell the same quantity as the long trade when `sma14` crosses under `sma28`,// effectively closing the long position.if ta.crossunder(sma14, sma28) and strategy.position_size > 0    strategy.order(\"My Long Exit ID\", strategy.short)"
  },
  {
    "name": "strategy.risk.allow_entry_in",
    "namespace": "strategy",
    "syntax": "strategy.risk.allow_entry_in(value) → void",
    "description": "This function can be used to specify in which market direction the strategy.entry() function is allowed to open positions.",
    "parameters": [
      {
        "name": "value",
        "type": "simple string",
        "description": "The allowed direction. Possible values: strategy.direction.all, strategy.direction.long, strategy.direction.short",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"strategy.risk.allow_entry_in\")strategy.risk.allow_entry_in(strategy.direction.long)if open > close    strategy.entry(\"Long\", strategy.long)// Instead of opening a short position with 10 contracts, this command will close long entries.if open < close    strategy.entry(\"Short\", strategy.short, qty = 10)"
  },
  {
    "name": "strategy.risk.max_cons_loss_days",
    "namespace": "strategy",
    "syntax": "strategy.risk.max_cons_loss_days(count, alert_message) → void",
    "description": "The purpose of this rule is to cancel all pending orders, close all open positions and stop placing orders after a specified number of consecutive days with losses. The rule affects the whole strategy.",
    "parameters": [
      {
        "name": "count",
        "type": "simple int",
        "description": "A required parameter. The allowed number of consecutive days with losses.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "simple string",
        "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"risk.max_cons_loss_days Demo 1\")strategy.risk.max_cons_loss_days(3) // No orders will be placed after 3 days, if each day is with loss.plot(strategy.position_size)"
  },
  {
    "name": "strategy.risk.max_drawdown",
    "namespace": "strategy",
    "syntax": "strategy.risk.max_drawdown(value, type, alert_message) → void",
    "description": "The purpose of this rule is to determine maximum drawdown. The rule affects the whole strategy. Once the maximum drawdown value is reached, all pending orders are cancelled, all open positions are closed and no new orders can be placed.",
    "parameters": [
      {
        "name": "value",
        "type": "simple int/float",
        "description": "A required parameter. The maximum drawdown value. It is specified either in money (base currency), or in percentage of maximum equity. For % of equity the range of allowed values is from 0 to 100.",
        "required": false
      },
      {
        "name": "type",
        "type": "simple string",
        "description": "A required parameter. The type of the value. Please specify one of the following values: strategy.percent_of_equity or strategy.cash. Note: if equity drops down to zero or to a negative and the 'strategy.percent_of_equity' is specified, all pending orders are cancelled, all open positions are closed and no new orders can be placed for good.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "simple string",
        "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"risk.max_drawdown Demo 1\")strategy.risk.max_drawdown(50, strategy.percent_of_equity) // set maximum drawdown to 50% of maximum equityplot(strategy.position_size)"
  },
  {
    "name": "strategy.risk.max_intraday_filled_orders",
    "namespace": "strategy",
    "syntax": "strategy.risk.max_intraday_filled_orders(count, alert_message) → void",
    "description": "The purpose of this rule is to determine maximum number of filled orders per 1 day (per 1 bar, if chart resolution is higher than 1 day). The rule affects the whole strategy. Once the maximum number of filled orders is reached, all pending orders are cancelled, all open positions are closed and no new orders can be placed till the end of the current trading session.",
    "parameters": [
      {
        "name": "count",
        "type": "simple int",
        "description": "A required parameter. The maximum number of filled orders per 1 day.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "simple string",
        "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"risk.max_intraday_filled_orders Demo\")strategy.risk.max_intraday_filled_orders(10) // After 10 orders are filled, no more strategy orders will be placed (except for a market order to exit current open market position, if there is any).if open > close    strategy.entry(\"buy\", strategy.long)if open < close    strategy.entry(\"sell\", strategy.short)"
  },
  {
    "name": "strategy.risk.max_intraday_loss",
    "namespace": "strategy",
    "syntax": "strategy.risk.max_intraday_loss(value, type, alert_message) → void",
    "description": "The maximum loss value allowed during a day. It is specified either in money (base currency), or in percentage of maximum intraday equity (0 -100).",
    "parameters": [
      {
        "name": "value",
        "type": "simple int/float",
        "description": "A required parameter. The maximum loss value. It is specified either in money (base currency), or in percentage of maximum intraday equity. For % of equity the range of allowed values is from 0 to 100.",
        "required": false
      },
      {
        "name": "type",
        "type": "simple string",
        "description": "A required parameter. The type of the value. Please specify one of the following values: strategy.percent_of_equity or strategy.cash. Note: if equity drops down to zero or to a negative and the strategy.percent_of_equity is specified, all pending orders are cancelled, all open positions are closed and no new orders can be placed for good.",
        "required": false
      },
      {
        "name": "alert_message",
        "type": "simple string",
        "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "// Sets the maximum intraday loss using the strategy's equity value.//@version=6strategy(\"strategy.risk.max_intraday_loss Example 1\", overlay = false, default_qty_type = strategy.percent_of_equity, default_qty_value = 100)// Input for maximum intraday loss %.lossPct = input.float(10)// Set maximum intraday loss to our lossPct inputstrategy.risk.max_intraday_loss(lossPct, strategy.percent_of_equity)// Enter Short at bar_index zero.if bar_index == 0    strategy.entry(\"Short\", strategy.short)// Store equity value from the beginning of the dayeqFromDayStart = ta.valuewhen(ta.change(dayofweek) > 0, strategy.equity, 0)// Calculate change of the current equity from the beginning of the current day.eqChgPct = 100 * ((strategy.equity - eqFromDayStart) / strategy.equity)// Plot itplot(eqChgPct)hline(-lossPct)"
  },
  {
    "name": "strategy.risk.max_position_size",
    "namespace": "strategy",
    "syntax": "strategy.risk.max_position_size(contracts) → void",
    "description": "The purpose of this rule is to determine maximum size of a market position. The rule affects the following function: strategy.entry(). The 'entry' quantity can be reduced (if needed) to such number of contracts/shares/lots/units, so the total position size doesn't exceed the value specified in 'strategy.risk.max_position_size'. If minimum possible quantity still violates the rule, the order will not be placed.",
    "parameters": [
      {
        "name": "contracts",
        "type": "simple int/float",
        "description": "A required parameter. Maximum number of contracts/shares/lots/units in a position.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6strategy(\"risk.max_position_size Demo\", default_qty_value = 100)strategy.risk.max_position_size(10)if open > close    strategy.entry(\"buy\", strategy.long)plot(strategy.position_size) // max plot value will be 10"
  },
  {
    "name": "string",
    "syntax": "string(x) → const string",
    "description": "Casts na to string",
    "parameters": [
      {
        "name": "x",
        "type": "const string",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "const string",
    "example": ""
  },
  {
    "name": "syminfo.prefix",
    "namespace": "syminfo",
    "syntax": "syminfo.prefix(symbol) → simple string",
    "description": "Returns exchange prefix of the symbol, e.g. \"NASDAQ\".",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"syminfo.prefix fun\", overlay=true)i_sym = input.symbol(\"NASDAQ:AAPL\")pref = syminfo.prefix(i_sym)tick = syminfo.ticker(i_sym)t = ticker.new(pref, tick, session.extended)s = request.security(t, \"1D\", close)plot(s)"
  },
  {
    "name": "syminfo.ticker",
    "namespace": "syminfo",
    "syntax": "syminfo.ticker(symbol) → simple string",
    "description": "Returns symbol name without exchange prefix, e.g. \"AAPL\".",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"syminfo.ticker fun\", overlay=true)i_sym = input.symbol(\"NASDAQ:AAPL\")pref = syminfo.prefix(i_sym)tick = syminfo.ticker(i_sym)t = ticker.new(pref, tick, session.extended)s = request.security(t, \"1D\", close)plot(s)"
  },
  {
    "name": "ta.alma",
    "namespace": "ta",
    "syntax": "ta.alma(series, length, offset, sigma, floor) → series float",
    "description": "Arnaud Legoux Moving Average. It uses Gaussian distribution as weights for moving average.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int/float",
        "description": "Controls tradeoff between smoothness (closer to 1) and responsiveness (closer to 0).",
        "required": false
      },
      {
        "name": "sigma",
        "type": "simple int/float",
        "description": "Changes the smoothness of ALMA. The larger sigma the smoother ALMA.",
        "required": false
      },
      {
        "name": "floor",
        "type": "simple bool",
        "description": "An optional parameter. Specifies whether the offset calculation is floored before ALMA is calculated. Default value is false.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.alma\", overlay=true)plot(ta.alma(close, 9, 0.85, 6))// same on pine, but much less efficientpine_alma(series, windowsize, offset, sigma) =>    m = offset * (windowsize - 1)    //m = math.floor(offset * (windowsize - 1)) // Used as m when math.floor=true    s = windowsize / sigma    norm = 0.0    sum = 0.0    for i = 0 to windowsize - 1        weight = math.exp(-1 * math.pow(i - m, 2) / (2 * math.pow(s, 2)))        norm := norm + weight        sum := sum + series[windowsize - i - 1] * weight    sum / normplot(pine_alma(close, 9, 0.85, 6))"
  },
  {
    "name": "ta.atr",
    "namespace": "ta",
    "syntax": "ta.atr(length) → series float",
    "description": "Function atr (average true range) returns the RMA of true range. True range is max(high - low, abs(high - close[1]), abs(low - close[1])).",
    "parameters": [
      {
        "name": "length",
        "type": "simple int",
        "description": "Length (number of bars back).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.atr\")plot(ta.atr(14))//the same on pinepine_atr(length) =>    trueRange = na(high[1])? high-low : math.max(math.max(high - low, math.abs(high - close[1])), math.abs(low - close[1]))    //true range can be also calculated with ta.tr(true)    ta.rma(trueRange, length)plot(pine_atr(14))"
  },
  {
    "name": "ta.barssince",
    "namespace": "ta",
    "syntax": "ta.barssince(condition) → series int",
    "description": "Counts the number of bars since the last time the condition was true.",
    "parameters": [
      {
        "name": "condition",
        "type": "series bool",
        "description": "The condition to check for.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"ta.barssince\")// get number of bars since last color.green barplot(ta.barssince(close >= open))"
  },
  {
    "name": "ta.bb",
    "namespace": "ta",
    "syntax": "ta.bb(series, length, mult) → [series float, series float, series float]",
    "description": "Bollinger Bands. A Bollinger Band is a technical analysis tool defined by a set of lines plotted two standard deviations (positively and negatively) away from a simple moving average (SMA) of the security's price, but can be adjusted to user preferences.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "mult",
        "type": "simple int/float",
        "description": "Standard deviation factor.",
        "required": false
      }
    ],
    "returns": "[series float, series float, series float]",
    "example": "//@version=6indicator(\"ta.bb\")[middle, upper, lower] = ta.bb(close, 5, 4)plot(middle, color=color.yellow)plot(upper, color=color.yellow)plot(lower, color=color.yellow)// the same on pinef_bb(src, length, mult) =>    float basis = ta.sma(src, length)    float dev = mult * ta.stdev(src, length)    [basis, basis + dev, basis - dev][pineMiddle, pineUpper, pineLower] = f_bb(close, 5, 4)plot(pineMiddle)plot(pineUpper)plot(pineLower)"
  },
  {
    "name": "ta.bbw",
    "namespace": "ta",
    "syntax": "ta.bbw(series, length, mult) → series float",
    "description": "Bollinger Bands Width. The Bollinger Band Width is the difference between the upper and the lower Bollinger Bands divided by the middle band.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "mult",
        "type": "simple int/float",
        "description": "Standard deviation factor.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.bbw\")plot(ta.bbw(close, 5, 4), color=color.yellow)// the same on pinef_bbw(src, length, mult) =>    float basis = ta.sma(src, length)    float dev = mult * ta.stdev(src, length)    (((basis + dev) - (basis - dev)) / basis) * 100plot(f_bbw(close, 5, 4))"
  },
  {
    "name": "ta.cci",
    "namespace": "ta",
    "syntax": "ta.cci(source, length) → series float",
    "description": "The CCI (commodity channel index) is calculated as the difference between the typical price of a commodity and its simple moving average, divided by the mean absolute deviation of the typical price. The index is scaled by an inverse factor of 0.015 to provide more readable numbers.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.change",
    "namespace": "ta",
    "syntax": "ta.change(source, length) → series int",
    "description": "Compares the current source value to its value length bars ago and returns the difference.",
    "parameters": [
      {
        "name": "source",
        "type": "series int",
        "description": "Source series.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "How far the past source value is offset from the current one, in bars. Optional. The default is 1.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator('Day and Direction Change', overlay = true)dailyBarTime = time('1D')isNewDay = ta.change(dailyBarTime) != 0bgcolor(isNewDay ? color.new(color.green, 80) : na)isGreenBar = close >= opencolorChange = ta.change(isGreenBar)plotshape(colorChange, 'Direction Change')"
  },
  {
    "name": "ta.cmo",
    "namespace": "ta",
    "syntax": "ta.cmo(series, length) → series float",
    "description": "Chande Momentum Oscillator. Calculates the difference between the sum of recent gains and the sum of recent losses and then divides the result by the sum of all price movement over the same period.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.cmo\")plot(ta.cmo(close, 5), color=color.yellow)// the same on pinef_cmo(src, length) =>    float mom = ta.change(src)    float sm1 = math.sum((mom >= 0) ? mom : 0.0, length)    float sm2 = math.sum((mom >= 0) ? 0.0 : -mom, length)    100 * (sm1 - sm2) / (sm1 + sm2)plot(f_cmo(close, 5))"
  },
  {
    "name": "ta.cog",
    "namespace": "ta",
    "syntax": "ta.cog(source, length) → series float",
    "description": "The cog (center of gravity) is an indicator based on statistics and the Fibonacci golden ratio.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.cog\", overlay=true)plot(ta.cog(close, 10))// the same on pinepine_cog(source, length) =>    sum = math.sum(source, length)    num = 0.0    for i = 0 to length - 1        price = source[i]        num := num + price * (i + 1)    -num / sumplot(pine_cog(close, 10))"
  },
  {
    "name": "ta.correlation",
    "namespace": "ta",
    "syntax": "ta.correlation(source1, source2, length) → series float",
    "description": "Correlation coefficient. Describes the degree to which two series tend to deviate from their ta.sma() values.",
    "parameters": [
      {
        "name": "source1",
        "type": "series int/float",
        "description": "Source series.",
        "required": false
      },
      {
        "name": "source2",
        "type": "series int/float",
        "description": "Target series.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Length (number of bars back).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.cross",
    "namespace": "ta",
    "syntax": "ta.cross(source1, source2) → series bool",
    "description": "",
    "parameters": [
      {
        "name": "source1",
        "type": "series int/float",
        "description": "First data series.",
        "required": false
      },
      {
        "name": "source2",
        "type": "series int/float",
        "description": "Second data series.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "ta.crossover",
    "namespace": "ta",
    "syntax": "ta.crossover(source1, source2) → series bool",
    "description": "The source1-series is defined as having crossed over source2-series if, on the current bar, the value of source1 is greater than the value of source2, and on the previous bar, the value of source1 was less than or equal to the value of source2.",
    "parameters": [
      {
        "name": "source1",
        "type": "series int/float",
        "description": "First data series.",
        "required": false
      },
      {
        "name": "source2",
        "type": "series int/float",
        "description": "Second data series.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "ta.crossunder",
    "namespace": "ta",
    "syntax": "ta.crossunder(source1, source2) → series bool",
    "description": "The source1-series is defined as having crossed under source2-series if, on the current bar, the value of source1 is less than the value of source2, and on the previous bar, the value of source1 was greater than or equal to the value of source2.",
    "parameters": [
      {
        "name": "source1",
        "type": "series int/float",
        "description": "First data series.",
        "required": false
      },
      {
        "name": "source2",
        "type": "series int/float",
        "description": "Second data series.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "ta.cum",
    "namespace": "ta",
    "syntax": "ta.cum(source) → series float",
    "description": "Cumulative (total) sum of source. In other words it's a sum of all elements of source.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source used for the calculation.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.dev",
    "namespace": "ta",
    "syntax": "ta.dev(source, length) → series float",
    "description": "Measure of difference between the series and it's ta.sma()",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.dev\")plot(ta.dev(close, 10))// the same on pinepine_dev(source, length) =>    mean = ta.sma(source, length)    sum = 0.0    for i = 0 to length - 1        val = source[i]        sum := sum + math.abs(val - mean)    dev = sum/lengthplot(pine_dev(close, 10))"
  },
  {
    "name": "ta.dmi",
    "namespace": "ta",
    "syntax": "ta.dmi(diLength, adxSmoothing) → [series float, series float, series float]",
    "description": "The dmi function returns the directional movement index.",
    "parameters": [
      {
        "name": "diLength",
        "type": "simple int",
        "description": "DI Period.",
        "required": false
      },
      {
        "name": "adxSmoothing",
        "type": "simple int",
        "description": "ADX Smoothing Period.",
        "required": false
      }
    ],
    "returns": "[series float, series float, series float]",
    "example": "//@version=6indicator(title=\"Directional Movement Index\", shorttitle=\"DMI\", format=format.price, precision=4)len = input.int(17, minval=1, title=\"DI Length\")lensig = input.int(14, title=\"ADX Smoothing\", minval=1)[diplus, diminus, adx] = ta.dmi(len, lensig)plot(adx, color=color.red, title=\"ADX\")plot(diplus, color=color.blue, title=\"+DI\")plot(diminus, color=color.orange, title=\"-DI\")"
  },
  {
    "name": "ta.ema",
    "namespace": "ta",
    "syntax": "ta.ema(source, length) → series float",
    "description": "The ema function returns the exponentially weighted moving average. In ema weighting factors decrease exponentially. It calculates by using a formula: EMA = alpha * source + (1 - alpha) * EMA[1], where alpha = 2 / (length + 1).",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.ema\")plot(ta.ema(close, 15))//the same on pinepine_ema(src, length) =>    alpha = 2 / (length + 1)    sum = 0.0    sum := na(sum[1]) ? src : alpha * src + (1 - alpha) * nz(sum[1])plot(pine_ema(close,15))"
  },
  {
    "name": "ta.falling",
    "namespace": "ta",
    "syntax": "ta.falling(source, length) → series bool",
    "description": "Test if the source series is now falling for length bars long.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "ta.highest",
    "namespace": "ta",
    "syntax": "ta.highest(source, length) → series float",
    "description": "Highest value for a given number of bars back.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.highestbars",
    "namespace": "ta",
    "syntax": "ta.highestbars(source, length) → series int",
    "description": "Highest value offset for a given number of bars back.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "ta.hma",
    "namespace": "ta",
    "syntax": "ta.hma(source, length) → series float",
    "description": "The hma function returns the Hull Moving Average.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"Hull Moving Average\")src = input(defval=close, title=\"Source\")length = input(defval=9, title=\"Length\")hmaBuildIn = ta.hma(src, length)plot(hmaBuildIn, title=\"Hull MA\", color=#674EA7)"
  },
  {
    "name": "ta.kc",
    "namespace": "ta",
    "syntax": "ta.kc(series, length, mult, useTrueRange) → [series float, series float, series float]",
    "description": "Keltner Channels. Keltner channel is a technical analysis indicator showing a central moving average line plus channel lines at a distance above and below.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "mult",
        "type": "simple int/float",
        "description": "Standard deviation factor.",
        "required": false
      },
      {
        "name": "useTrueRange",
        "type": "simple bool",
        "description": "An optional parameter. Specifies if True Range is used; default is true. If the value is false, the range will be calculated with the expression (high - low).",
        "required": false
      }
    ],
    "returns": "[series float, series float, series float]",
    "example": "//@version=6indicator(\"ta.kc\")[middle, upper, lower] = ta.kc(close, 5, 4)plot(middle, color=color.yellow)plot(upper, color=color.yellow)plot(lower, color=color.yellow)// the same on pinef_kc(src, length, mult, useTrueRange) =>    float basis = ta.ema(src, length)    float span = (useTrueRange) ? ta.tr : (high - low)    float rangeEma = ta.ema(span, length)    [basis, basis + rangeEma * mult, basis - rangeEma * mult][pineMiddle, pineUpper, pineLower] = f_kc(close, 5, 4, true)plot(pineMiddle)plot(pineUpper)plot(pineLower)"
  },
  {
    "name": "ta.kcw",
    "namespace": "ta",
    "syntax": "ta.kcw(series, length, mult, useTrueRange) → series float",
    "description": "Keltner Channels Width. The Keltner Channels Width is the difference between the upper and the lower Keltner Channels divided by the middle channel.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "mult",
        "type": "simple int/float",
        "description": "Standard deviation factor.",
        "required": false
      },
      {
        "name": "useTrueRange",
        "type": "simple bool",
        "description": "An optional parameter. Specifies if True Range is used; default is true. If the value is false, the range will be calculated with the expression (high - low).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.kcw\")plot(ta.kcw(close, 5, 4), color=color.yellow)// the same on pinef_kcw(src, length, mult, useTrueRange) =>    float basis = ta.ema(src, length)    float span = (useTrueRange) ? ta.tr : (high - low)    float rangeEma = ta.ema(span, length)    ((basis + rangeEma * mult) - (basis - rangeEma * mult)) / basisplot(f_kcw(close, 5, 4, true))"
  },
  {
    "name": "ta.linreg",
    "namespace": "ta",
    "syntax": "ta.linreg(source, length, offset) → series float",
    "description": "Linear regression curve. A line that best fits the prices specified over a user-defined time period. It is calculated using the least squares method. The result of this function is calculated using the formula: linreg = intercept + slope * (length - 1 - offset), where intercept and slope are the values calculated with the least squares method on source series.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source series.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "offset",
        "type": "simple int",
        "description": "Offset.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.lowest",
    "namespace": "ta",
    "syntax": "ta.lowest(source, length) → series float",
    "description": "Lowest value for a given number of bars back.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.lowestbars",
    "namespace": "ta",
    "syntax": "ta.lowestbars(source, length) → series int",
    "description": "Lowest value offset for a given number of bars back.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars back.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "ta.macd",
    "namespace": "ta",
    "syntax": "ta.macd(source, fastlen, slowlen, siglen) → [series float, series float, series float]",
    "description": "MACD (moving average convergence/divergence). It is supposed to reveal changes in the strength, direction, momentum, and duration of a trend in a stock's price.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "fastlen",
        "type": "simple int",
        "description": "Fast Length parameter.",
        "required": false
      },
      {
        "name": "slowlen",
        "type": "simple int",
        "description": "Slow Length parameter.",
        "required": false
      },
      {
        "name": "siglen",
        "type": "simple int",
        "description": "Signal Length parameter.",
        "required": false
      }
    ],
    "returns": "[series float, series float, series float]",
    "example": "//@version=6indicator(\"MACD\")[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)plot(macdLine, color=color.blue)plot(signalLine, color=color.orange)plot(histLine, color=color.red, style=plot.style_histogram)"
  },
  {
    "name": "ta.max",
    "namespace": "ta",
    "syntax": "ta.max(source) → series float",
    "description": "Returns the all-time high value of source from the beginning of the chart up to the current bar.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source used for the calculation.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.median",
    "namespace": "ta",
    "syntax": "ta.median(source, length) → series int",
    "description": "Returns the median of the series.",
    "parameters": [
      {
        "name": "source",
        "type": "series int",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "ta.mfi",
    "namespace": "ta",
    "syntax": "ta.mfi(series, length) → series float",
    "description": "Money Flow Index. The Money Flow Index (MFI) is a technical oscillator that uses price and volume for identifying overbought or oversold conditions in an asset.",
    "parameters": [
      {
        "name": "series",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"Money Flow Index\")plot(ta.mfi(hlc3, 14), color=color.yellow)// the same on pinepine_mfi(src, length) =>    float upper = math.sum(volume * (ta.change(src) <= 0.0 ? 0.0 : src), length)    float lower = math.sum(volume * (ta.change(src) >= 0.0 ? 0.0 : src), length)    mfi = 100.0 - (100.0 / (1.0 + upper / lower))    mfiplot(pine_mfi(hlc3, 14))"
  },
  {
    "name": "ta.min",
    "namespace": "ta",
    "syntax": "ta.min(source) → series float",
    "description": "Returns the all-time low value of source from the beginning of the chart up to the current bar.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source used for the calculation.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.mode",
    "namespace": "ta",
    "syntax": "ta.mode(source, length) → series int",
    "description": "Returns the mode of the series. If there are several values with the same frequency, it returns the smallest value.",
    "parameters": [
      {
        "name": "source",
        "type": "series int",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "ta.mom",
    "namespace": "ta",
    "syntax": "ta.mom(source, length) → series float",
    "description": "Momentum of source price and source price length bars ago. This is simply a difference: source - source[length].",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Offset from the current bar to the previous bar.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.percentile_linear_interpolation",
    "namespace": "ta",
    "syntax": "ta.percentile_linear_interpolation(source, length, percentage) → series float",
    "description": "Calculates percentile using method of linear interpolation between the two nearest ranks.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process (source).",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars back (length).",
        "required": false
      },
      {
        "name": "percentage",
        "type": "simple int/float",
        "description": "Percentage, a number from range 0..100.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.percentile_nearest_rank",
    "namespace": "ta",
    "syntax": "ta.percentile_nearest_rank(source, length, percentage) → series float",
    "description": "Calculates percentile using method of Nearest Rank.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process (source).",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars back (length).",
        "required": false
      },
      {
        "name": "percentage",
        "type": "simple int/float",
        "description": "Percentage, a number from range 0..100.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.percentrank",
    "namespace": "ta",
    "syntax": "ta.percentrank(source, length) → series float",
    "description": "Percent rank is the percents of how many previous values was less than or equal to the current value of given series.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.pivot_point_levels",
    "namespace": "ta",
    "syntax": "ta.pivot_point_levels(type, anchor, developing) → array<float>",
    "description": "Calculates the pivot point levels using the specified type and anchor.",
    "parameters": [
      {
        "name": "type",
        "type": "series string",
        "description": "The type of pivot point levels. Possible values: \"Traditional\", \"Fibonacci\", \"Woodie\", \"Classic\", \"DM\", \"Camarilla\".",
        "required": false
      },
      {
        "name": "anchor",
        "type": "series bool",
        "description": "The condition that triggers the reset of the pivot point calculations. When true, calculations reset; when false, results calculated at the last reset persist.",
        "required": false
      },
      {
        "name": "developing",
        "type": "series bool",
        "description": "If false, the values are those calculated the last time the anchor condition was true. They remain constant until the anchor condition becomes true again. If true, the pivots are developing, i.e., they constantly recalculate on the data developing between the point of the last anchor (or bar zero if the anchor condition was never true) and the current bar. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "array<float>",
    "example": "//@version=6indicator(\"Weekly Pivots\", max_lines_count=500, overlay=true)timeframe = \"1W\"typeInput = input.string(\"Traditional\", \"Type\", options=[\"Traditional\", \"Fibonacci\", \"Woodie\", \"Classic\", \"DM\", \"Camarilla\"])weekChange = timeframe.change(timeframe)pivotPointsArray = ta.pivot_point_levels(typeInput, weekChange)if weekChange    for pivotLevel in pivotPointsArray        line.new(time, pivotLevel, time + timeframe.in_seconds(timeframe) * 1000, pivotLevel, xloc=xloc.bar_time)"
  },
  {
    "name": "ta.pivothigh",
    "namespace": "ta",
    "syntax": "ta.pivothigh(leftbars, rightbars) → series float",
    "description": "This function returns price of the pivot high point. It returns 'NaN', if there was no pivot high point.",
    "parameters": [
      {
        "name": "leftbars",
        "type": "series int/float",
        "description": "Left strength.",
        "required": false
      },
      {
        "name": "rightbars",
        "type": "series int/float",
        "description": "Right strength.",
        "required": false
      },
      {
        "name": "source",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"PivotHigh\", overlay=true)leftBars = input(2)rightBars=input(2)ph = ta.pivothigh(leftBars, rightBars)plot(ph, style=plot.style_cross, linewidth=3, color= color.red, offset=-rightBars)"
  },
  {
    "name": "ta.pivotlow",
    "namespace": "ta",
    "syntax": "ta.pivotlow(leftbars, rightbars) → series float",
    "description": "This function returns price of the pivot low point. It returns 'NaN', if there was no pivot low point.",
    "parameters": [
      {
        "name": "leftbars",
        "type": "series int/float",
        "description": "Left strength.",
        "required": false
      },
      {
        "name": "rightbars",
        "type": "series int/float",
        "description": "Right strength.",
        "required": false
      },
      {
        "name": "source",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"PivotLow\", overlay=true)leftBars = input(2)rightBars=input(2)pl = ta.pivotlow(close, leftBars, rightBars)plot(pl, style=plot.style_cross, linewidth=3, color= color.blue, offset=-rightBars)"
  },
  {
    "name": "ta.range",
    "namespace": "ta",
    "syntax": "ta.range(source, length) → series int",
    "description": "Returns the difference between the min and max values in a series.",
    "parameters": [
      {
        "name": "source",
        "type": "series int",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "ta.rci",
    "namespace": "ta",
    "syntax": "ta.rci(source, length) → series float",
    "description": "Calculates the Rank Correlation Index (RCI), which measures the directional consistency of price movements. It evaluates the monotonic relationship between a source series and the bar index over length bars using Spearman's rank correlation coefficient. The resulting value is scaled to a range of -100 to 100, where 100 indicates the source consistently increased over the period, and -100 indicates it consistently decreased. Values between -100 and 100 reflect varying degrees of upward or downward consistency.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.rising",
    "namespace": "ta",
    "syntax": "ta.rising(source, length) → series bool",
    "description": "Test if the source series is now rising for length bars long.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": ""
  },
  {
    "name": "ta.rma",
    "namespace": "ta",
    "syntax": "ta.rma(source, length) → series float",
    "description": "Moving average used in RSI. It is the exponentially weighted moving average with alpha = 1 / length.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.rma\")plot(ta.rma(close, 15))//the same on pinepine_rma(src, length) =>    alpha = 1/length    sum = 0.0    sum := na(sum[1]) ? ta.sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])plot(pine_rma(close, 15))"
  },
  {
    "name": "ta.roc",
    "namespace": "ta",
    "syntax": "ta.roc(source, length) → series float",
    "description": "Calculates the percentage of change (rate of change) between the current value of source and its value length bars ago.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.rsi",
    "namespace": "ta",
    "syntax": "ta.rsi(source, length) → series float",
    "description": "Relative strength index. It is calculated using the ta.rma() of upward and downward changes of source over the last length bars.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "simple int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.rsi\")plot(ta.rsi(close, 7))// same on pine, but less efficientpine_rsi(x, y) =>    u = math.max(x - x[1], 0) // upward ta.change    d = math.max(x[1] - x, 0) // downward ta.change    rs = ta.rma(u, y) / ta.rma(d, y)    res = 100 - 100 / (1 + rs)    resplot(pine_rsi(close, 7))"
  },
  {
    "name": "ta.sar",
    "namespace": "ta",
    "syntax": "ta.sar(start, inc, max) → series float",
    "description": "Parabolic SAR (parabolic stop and reverse) is a method devised by J. Welles Wilder, Jr., to find potential reversals in the market price direction of traded goods.",
    "parameters": [
      {
        "name": "start",
        "type": "simple int/float",
        "description": "Start.",
        "required": false
      },
      {
        "name": "inc",
        "type": "simple int/float",
        "description": "Increment.",
        "required": false
      },
      {
        "name": "max",
        "type": "simple int/float",
        "description": "Maximum.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.sar\")plot(ta.sar(0.02, 0.02, 0.2), style=plot.style_cross, linewidth=3)// The same on Pine Script®pine_sar(start, inc, max) =>    var float result = na    var float maxMin = na    var float acceleration = na    var bool isBelow = false    bool isFirstTrendBar = false    if bar_index == 1        if close > close[1]            isBelow := true            maxMin := high            result := low[1]        else            isBelow := false            maxMin := low            result := high[1]        isFirstTrendBar := true        acceleration := start    result := result + acceleration * (maxMin - result)    if isBelow        if result > low            isFirstTrendBar := true            isBelow := false            result := math.max(high, maxMin)            maxMin := low            acceleration := start    else        if result < high            isFirstTrendBar := true            isBelow := true            result := math.min(low, maxMin)            maxMin := high            acceleration := start                if not isFirstTrendBar        if isBelow            if high > maxMin                maxMin := high                acceleration := math.min(acceleration + inc, max)        else            if low < maxMin                maxMin := low                acceleration := math.min(acceleration + inc, max)    if isBelow        result := math.min(result, low[1])        if bar_index > 1            result := math.min(result, low[2])            else        result := math.max(result, high[1])        if bar_index > 1            result := math.max(result, high[2])    resultplot(pine_sar(0.02, 0.02, 0.2), style=plot.style_cross, linewidth=3)"
  },
  {
    "name": "ta.sma",
    "namespace": "ta",
    "syntax": "ta.sma(source, length) → series float",
    "description": "The sma function returns the moving average, that is the sum of last y values of x, divided by y.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.sma\")plot(ta.sma(close, 15))// same on pine, but much less efficientpine_sma(x, y) =>    sum = 0.0    for i = 0 to y - 1        sum := sum + x[i] / y    sumplot(pine_sma(close, 15))"
  },
  {
    "name": "ta.stdev",
    "namespace": "ta",
    "syntax": "ta.stdev(source, length, biased) → series float",
    "description": "",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "biased",
        "type": "series bool",
        "description": "Determines which estimate should be used. Optional. The default is true.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.stdev\")plot(ta.stdev(close, 5))//the same on pineisZero(val, eps) => math.abs(val) <= epsSUM(fst, snd) =>    EPS = 1e-10    res = fst + snd    if isZero(res, EPS)        res := 0    else        if not isZero(res, 1e-4)            res := res        else            15pine_stdev(src, length) =>    avg = ta.sma(src, length)    sumOfSquareDeviations = 0.0    for i = 0 to length - 1        sum = SUM(src[i], -avg)        sumOfSquareDeviations := sumOfSquareDeviations + sum * sum    stdev = math.sqrt(sumOfSquareDeviations / length)plot(pine_stdev(close, 5))"
  },
  {
    "name": "ta.stoch",
    "namespace": "ta",
    "syntax": "ta.stoch(source, high, low, length) → series float",
    "description": "Stochastic. It is calculated by a formula: 100 * (close - lowest(low, length)) / (highest(high, length) - lowest(low, length)).",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source series.",
        "required": false
      },
      {
        "name": "high",
        "type": "series int/float",
        "description": "Series of high.",
        "required": false
      },
      {
        "name": "low",
        "type": "series int/float",
        "description": "Series of low.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Length (number of bars back).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.supertrend",
    "namespace": "ta",
    "syntax": "ta.supertrend(factor, atrPeriod) → [series float, series float]",
    "description": "The Supertrend Indicator. The Supertrend is a trend following indicator.",
    "parameters": [
      {
        "name": "factor",
        "type": "series int/float",
        "description": "The multiplier by which the ATR will get multiplied.",
        "required": false
      },
      {
        "name": "atrPeriod",
        "type": "simple int",
        "description": "Length of ATR.",
        "required": false
      }
    ],
    "returns": "[series float, series float]",
    "example": "//@version=6indicator(\"Pine Script® Supertrend\")[supertrend, direction] = ta.supertrend(3, 10)plot(direction < 0 ? supertrend : na, \"Up direction\", color = color.green, style=plot.style_linebr)plot(direction > 0 ? supertrend : na, \"Down direction\", color = color.red, style=plot.style_linebr)// The same on Pine Script®pine_supertrend(factor, atrPeriod) =>    src = hl2    atr = ta.atr(atrPeriod)    upperBand = src + factor * atr    lowerBand = src - factor * atr    prevLowerBand = nz(lowerBand[1])    prevUpperBand = nz(upperBand[1])    lowerBand := lowerBand > prevLowerBand or close[1] < prevLowerBand ? lowerBand : prevLowerBand    upperBand := upperBand < prevUpperBand or close[1] > prevUpperBand ? upperBand : prevUpperBand    int _direction = na    float superTrend = na    prevSuperTrend = superTrend[1]    if na(atr[1])        _direction := 1    else if prevSuperTrend == prevUpperBand        _direction := close > upperBand ? -1 : 1    else        _direction := close < lowerBand ? 1 : -1    superTrend := _direction == -1 ? lowerBand : upperBand    [superTrend, _direction][Pine_Supertrend, pineDirection] = pine_supertrend(3, 10)plot(pineDirection < 0 ? Pine_Supertrend : na, \"Up direction\", color = color.green, style=plot.style_linebr)plot(pineDirection > 0 ? Pine_Supertrend : na, \"Down direction\", color = color.red, style=plot.style_linebr)"
  },
  {
    "name": "ta.swma",
    "namespace": "ta",
    "syntax": "ta.swma(source) → series float",
    "description": "Symmetrically weighted moving average with fixed length: 4. Weights: [1/6, 2/6, 2/6, 1/6].",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source series.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.swma\")plot(ta.swma(close))// same on pine, but less efficientpine_swma(x) =>    x[3] * 1 / 6 + x[2] * 2 / 6 + x[1] * 2 / 6 + x[0] * 1 / 6plot(pine_swma(close))"
  },
  {
    "name": "ta.tr",
    "namespace": "ta",
    "syntax": "ta.tr(handle_na) → series float",
    "description": "Calculates the current bar's true range. Unlike a bar's actual range (high - low), true range accounts for potential gaps by taking the maximum of the current bar's actual range and the absolute distances from the previous bar's close to the current bar's high and low. The formula is: math.max(high - low, math.abs(high - close[1]), math.abs(low - close[1])).",
    "parameters": [
      {
        "name": "handle_na",
        "type": "simple bool",
        "description": "Defines how the function calculates the result when the previous bar's close is na. If true, the function returns the bar's high - low value. If false, it returns na.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.tsi",
    "namespace": "ta",
    "syntax": "ta.tsi(source, short_length, long_length) → series float",
    "description": "True strength index. It uses moving averages of the underlying momentum of a financial instrument.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source series.",
        "required": false
      },
      {
        "name": "short_length",
        "type": "simple int",
        "description": "Short length.",
        "required": false
      },
      {
        "name": "long_length",
        "type": "simple int",
        "description": "Long length.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.valuewhen",
    "namespace": "ta",
    "syntax": "ta.valuewhen(condition, source, occurrence) → series color",
    "description": "Returns the value of the source series on the bar where the condition was true on the nth most recent occurrence.",
    "parameters": [
      {
        "name": "condition",
        "type": "series bool",
        "description": "The condition to search for.",
        "required": false
      },
      {
        "name": "source",
        "type": "series color",
        "description": "The value to be returned from the bar where the condition is met.",
        "required": false
      },
      {
        "name": "occurrence",
        "type": "simple int",
        "description": "The occurrence of the condition. The numbering starts from 0 and goes back in time, so '0' is the most recent occurrence of condition, '1' is the second most recent and so forth. Must be an integer >= 0.",
        "required": false
      }
    ],
    "returns": "series color",
    "example": "//@version=6indicator(\"ta.valuewhen\")slow = ta.sma(close, 7)fast = ta.sma(close, 14)// Get value of `close` on second most recent crossplot(ta.valuewhen(ta.cross(slow, fast), close, 1))"
  },
  {
    "name": "ta.variance",
    "namespace": "ta",
    "syntax": "ta.variance(source, length, biased) → series float",
    "description": "Variance is the expectation of the squared deviation of a series from its mean (ta.sma()), and it informally measures how far a set of numbers are spread out from their mean.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      },
      {
        "name": "biased",
        "type": "series bool",
        "description": "Determines which estimate should be used. Optional. The default is true.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": ""
  },
  {
    "name": "ta.vwap",
    "namespace": "ta",
    "syntax": "ta.vwap(source, anchor) → series float",
    "description": "Volume weighted average price.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Source used for the VWAP calculation.",
        "required": false
      },
      {
        "name": "anchor",
        "type": "series bool",
        "description": "The condition that triggers the reset of VWAP calculations. When true, calculations reset; when false, calculations proceed using the values accumulated since the previous reset. Optional. The default is equivalent to passing timeframe.change() with \"1D\" as its argument.",
        "required": false
      },
      {
        "name": "stdev_mult",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"Simple VWAP\")vwap = ta.vwap(open)plot(vwap)"
  },
  {
    "name": "ta.vwma",
    "namespace": "ta",
    "syntax": "ta.vwma(source, length) → series float",
    "description": "The vwma function returns volume-weighted moving average of source for length bars back. It is the same as: sma(source * volume, length) / sma(volume, length).",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.vwma\")plot(ta.vwma(close, 15))// same on pine, but less efficientpine_vwma(x, y) =>    ta.sma(x * volume, y) / ta.sma(volume, y)plot(pine_vwma(close, 15))"
  },
  {
    "name": "ta.wma",
    "namespace": "ta",
    "syntax": "ta.wma(source, length) → series float",
    "description": "The wma function returns weighted moving average of source for length bars back. In wma weighting factors decrease in arithmetical progression.",
    "parameters": [
      {
        "name": "source",
        "type": "series int/float",
        "description": "Series of values to process.",
        "required": false
      },
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars (length).",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"ta.wma\")plot(ta.wma(close, 15))// same on pine, but much less efficientpine_wma(x, y) =>    norm = 0.0    sum = 0.0    for i = 0 to y - 1        weight = (y - i) * y        norm := norm + weight        sum := sum + x[i] * weight    sum / normplot(pine_wma(close, 15))"
  },
  {
    "name": "ta.wpr",
    "namespace": "ta",
    "syntax": "ta.wpr(length) → series float",
    "description": "Williams %R. The oscillator shows the current closing price in relation to the high and low of the past 'length' bars.",
    "parameters": [
      {
        "name": "length",
        "type": "series int",
        "description": "Number of bars.",
        "required": false
      }
    ],
    "returns": "series float",
    "example": "//@version=6indicator(\"Williams %R\", shorttitle=\"%R\", format=format.price, precision=2)plot(ta.wpr(14), title=\"%R\", color=color.new(#ff6d00, 0))"
  },
  {
    "name": "table",
    "syntax": "table(x) → series table",
    "description": "Casts na to table",
    "parameters": [
      {
        "name": "x",
        "type": "series table",
        "description": "The value to convert to the specified type, usually na.",
        "required": false
      }
    ],
    "returns": "series table",
    "example": ""
  },
  {
    "name": "table.cell",
    "namespace": "table",
    "syntax": "table.cell(table_id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family, text_formatting) → void",
    "description": "The function defines a cell in the table and sets its attributes.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "The text to be displayed inside the cell. Optional. The default is empty string.",
        "required": false
      },
      {
        "name": "width",
        "type": "series int/float",
        "description": "The width of the cell as a % of the indicator's visual space. Optional. By default, auto-adjusts the width based on the text inside the cell. Value 0 has the same effect.",
        "required": false
      },
      {
        "name": "height",
        "type": "series int/float",
        "description": "The height of the cell as a % of the indicator's visual space. Optional. By default, auto-adjusts the height based on the text inside of the cell. Value 0 has the same effect.",
        "required": false
      },
      {
        "name": "text_color",
        "type": "series color",
        "description": "The color of the text. Optional. The default is color.black.",
        "required": false
      },
      {
        "name": "text_halign",
        "type": "series string",
        "description": "The horizontal alignment of the cell's text. Optional. The default value is text.align_center. Possible values: text.align_left, text.align_center, text.align_right.",
        "required": false
      },
      {
        "name": "text_valign",
        "type": "series string",
        "description": "The vertical alignment of the cell's text. Optional. The default value is text.align_center. Possible values: text.align_top, text.align_center, text.align_bottom.",
        "required": false
      },
      {
        "name": "text_size",
        "type": "series int/string",
        "description": "Size of the object. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.normal or 14.",
        "required": false
      },
      {
        "name": "bgcolor",
        "type": "series color",
        "description": "The background color of the text. Optional. The default is no color.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "series string",
        "description": "The tooltip to be displayed inside the cell. Optional.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_bgcolor",
    "namespace": "table",
    "syntax": "table.cell_set_bgcolor(table_id, column, row, bgcolor) → void",
    "description": "The function sets the background color of the cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "bgcolor",
        "type": "series color",
        "description": "The background color of the cell.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_height",
    "namespace": "table",
    "syntax": "table.cell_set_height(table_id, column, row, height) → void",
    "description": "The function sets the height of cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "height",
        "type": "series int/float",
        "description": "The height of the cell as a % of the chart window. Passing 0 auto-adjusts the height based on the text inside of the cell.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_text",
    "namespace": "table",
    "syntax": "table.cell_set_text(table_id, column, row, text) → void",
    "description": "The function sets the text in the specified cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text",
        "type": "series string",
        "description": "The text to be displayed inside the cell.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"TABLE example\")var tLog = table.new(position = position.top_left, rows = 1, columns = 2, bgcolor = color.yellow, border_width=1)table.cell(tLog, row = 0, column = 0, text = \"sometext\", text_color = color.blue)table.cell_set_text(tLog, row = 0, column = 0, text = \"sometext\")"
  },
  {
    "name": "table.cell_set_text_color",
    "namespace": "table",
    "syntax": "table.cell_set_text_color(table_id, column, row, text_color) → void",
    "description": "The function sets the color of the text inside the cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_color",
        "type": "series color",
        "description": "The color of the text.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_text_font_family",
    "namespace": "table",
    "syntax": "table.cell_set_text_font_family(table_id, column, row, text_font_family) → void",
    "description": "The function sets the font family of the text inside the cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_font_family",
        "type": "series string",
        "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"Example of setting the table cell font\")var t = table.new(position.top_left, rows = 1, columns = 1)table.cell(t, 0, 0, \"monospace\", text_color = color.blue)table.cell_set_text_font_family(t, 0, 0, font.family_monospace)"
  },
  {
    "name": "table.cell_set_text_formatting",
    "namespace": "table",
    "syntax": "table.cell_set_text_formatting(table_id, column, row, text_formatting) → void",
    "description": "Sets the formatting attributes the drawing applies to displayed text.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_formatting",
        "type": "const text_format",
        "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_text_halign",
    "namespace": "table",
    "syntax": "table.cell_set_text_halign(table_id, column, row, text_halign) → void",
    "description": "The function sets the horizontal alignment of the cell's text.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_halign",
        "type": "series string",
        "description": "The horizontal alignment of a cell's text. Possible values: text.align_left, text.align_center, text.align_right.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_text_size",
    "namespace": "table",
    "syntax": "table.cell_set_text_size(table_id, column, row, text_size) → void",
    "description": "The function sets the size of the cell's text.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_size",
        "type": "series int/string",
        "description": "Size of the object. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.normal or 14.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_text_valign",
    "namespace": "table",
    "syntax": "table.cell_set_text_valign(table_id, column, row, text_valign) → void",
    "description": "The function sets the vertical alignment of a cell's text.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "text_valign",
        "type": "series string",
        "description": "The vertical alignment of the cell's text. Possible values: text.align_top, text.align_center, text.align_bottom.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.cell_set_tooltip",
    "namespace": "table",
    "syntax": "table.cell_set_tooltip(table_id, column, row, tooltip) → void",
    "description": "The function sets the tooltip in the specified cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "tooltip",
        "type": "series string",
        "description": "The tooltip to be displayed inside the cell.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"TABLE example\")var tLog = table.new(position = position.top_left, rows = 1, columns = 2, bgcolor = color.yellow, border_width=1)table.cell(tLog, row = 0, column = 0, text = \"sometext\", text_color = color.blue)table.cell_set_tooltip(tLog, row = 0, column = 0, tooltip = \"sometext\")"
  },
  {
    "name": "table.cell_set_width",
    "namespace": "table",
    "syntax": "table.cell_set_width(table_id, column, row, width) → void",
    "description": "The function sets the width of the cell.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "column",
        "type": "series int",
        "description": "The index of the cell's column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "row",
        "type": "series int",
        "description": "The index of the cell's row. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "width",
        "type": "series int/float",
        "description": "The width of the cell as a % of the chart window. Passing 0 auto-adjusts the width based on the text inside of the cell.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.clear",
    "namespace": "table",
    "syntax": "table.clear(table_id, start_column, start_row, end_column, end_row) → void",
    "description": "The function removes a cell or a sequence of cells from the table. The cells are removed in a rectangle shape where the start_column and start_row specify the top-left corner, and end_column and end_row specify the bottom-right corner.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "start_column",
        "type": "series int",
        "description": "The index of the column of the first cell to delete. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "start_row",
        "type": "series int",
        "description": "The index of the row of the first cell to delete. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "end_column",
        "type": "series int",
        "description": "The index of the column of the last cell to delete. Optional. The default is the argument used for start_column. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "end_row",
        "type": "series int",
        "description": "The index of the row of the last cell to delete. Optional. The default is the argument used for start_row. Numbering starts at 0.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"A donut\", overlay=true)if barstate.islast    colNum = 8, rowNum = 8    padding = \"◯\"    donutTable = table.new(position.middle_right, colNum, rowNum)    for c = 0 to colNum - 1        for r = 0 to rowNum - 1            table.cell(donutTable, c, r, text=padding, bgcolor=#face6e, text_color=color.new(color.black, 100))    table.clear(donutTable, 2, 2, 5, 5)"
  },
  {
    "name": "table.delete",
    "namespace": "table",
    "syntax": "table.delete(table_id) → void",
    "description": "The function deletes a table.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"table.delete example\")var testTable = table.new(position = position.top_right, columns = 2, rows = 1, bgcolor = color.yellow, border_width = 1)if barstate.islast    table.cell(table_id = testTable, column = 0, row = 0, text = \"Open is \" + str.tostring(open))    table.cell(table_id = testTable, column = 1, row = 0, text = \"Close is \" + str.tostring(close), bgcolor=color.teal)if barstate.isrealtime    table.delete(testTable)"
  },
  {
    "name": "table.merge_cells",
    "namespace": "table",
    "syntax": "table.merge_cells(table_id, start_column, start_row, end_column, end_row) → void",
    "description": "The function merges a sequence of cells in the table into one cell. The cells are merged in a rectangle shape where the start_column and start_row specify the top-left corner, and end_column and end_row specify the bottom-right corner.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "start_column",
        "type": "series int",
        "description": "The index of the column of the first cell to merge. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "start_row",
        "type": "series int",
        "description": "The index of the row of the first cell to merge. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "end_column",
        "type": "series int",
        "description": "The index of the column of the last cell to merge. Numbering starts at 0.",
        "required": false
      },
      {
        "name": "end_row",
        "type": "series int",
        "description": "The index of the row of the last cell to merge. Numbering starts at 0.",
        "required": false
      }
    ],
    "returns": "void",
    "example": "//@version=6indicator(\"table.merge_cells example\")SMA50  = ta.sma(close, 50)SMA100 = ta.sma(close, 100)SMA200 = ta.sma(close, 200)if barstate.islast    maTable = table.new(position.bottom_right, 3, 3, bgcolor = color.gray, border_width = 1, border_color = color.black)    // Header    table.cell(maTable, 0, 0, text = \"SMA Table\")    table.merge_cells(maTable, 0, 0, 2, 0)    // Cell Titles    table.cell(maTable, 0, 1, text = \"SMA 50\")    table.cell(maTable, 1, 1, text = \"SMA 100\")    table.cell(maTable, 2, 1, text = \"SMA 200\")    // Values    table.cell(maTable, 0, 2, bgcolor = color.white, text = str.tostring(SMA50))    table.cell(maTable, 1, 2, bgcolor = color.white, text = str.tostring(SMA100))    table.cell(maTable, 2, 2, bgcolor = color.white, text = str.tostring(SMA200))"
  },
  {
    "name": "table.new",
    "namespace": "table",
    "syntax": "table.new(position, columns, rows, bgcolor, frame_color, frame_width, border_color, border_width, force_overlay) → series table",
    "description": "The function creates a new table.",
    "parameters": [
      {
        "name": "position",
        "type": "series string",
        "description": "Position of the table. Possible values are: position.top_left, position.top_center, position.top_right, position.middle_left, position.middle_center, position.middle_right, position.bottom_left, position.bottom_center, position.bottom_right.",
        "required": false
      },
      {
        "name": "columns",
        "type": "series int",
        "description": "The number of columns in the table.",
        "required": false
      },
      {
        "name": "rows",
        "type": "series int",
        "description": "The number of rows in the table.",
        "required": false
      },
      {
        "name": "bgcolor",
        "type": "series color",
        "description": "The background color of the table. Optional. The default is no color.",
        "required": false
      },
      {
        "name": "frame_color",
        "type": "series color",
        "description": "The color of the outer frame of the table. Optional. The default is no color.",
        "required": false
      },
      {
        "name": "frame_width",
        "type": "series int",
        "description": "The width of the outer frame of the table. Optional. The default is 0.",
        "required": false
      },
      {
        "name": "border_color",
        "type": "series color",
        "description": "The color of the borders of the cells (excluding the outer frame). Optional. The default is no color.",
        "required": false
      },
      {
        "name": "border_width",
        "type": "series int",
        "description": "The width of the borders of the cells (excluding the outer frame). Optional. The default is 0.",
        "required": false
      },
      {
        "name": "force_overlay",
        "type": "const bool",
        "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
        "required": false
      }
    ],
    "returns": "series table",
    "example": "//@version=6indicator(\"table.new example\")var testTable = table.new(position = position.top_right, columns = 2, rows = 1, bgcolor = color.yellow, border_width = 1)if barstate.islast    table.cell(table_id = testTable, column = 0, row = 0, text = \"Open is \" + str.tostring(open))    table.cell(table_id = testTable, column = 1, row = 0, text = \"Close is \" + str.tostring(close), bgcolor=color.teal)"
  },
  {
    "name": "table.set_bgcolor",
    "namespace": "table",
    "syntax": "table.set_bgcolor(table_id, bgcolor) → void",
    "description": "The function sets the background color of a table.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "bgcolor",
        "type": "series color",
        "description": "The background color of the table. Optional. The default is no color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.set_border_color",
    "namespace": "table",
    "syntax": "table.set_border_color(table_id, border_color) → void",
    "description": "The function sets the color of the borders (excluding the outer frame) of the table's cells.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "border_color",
        "type": "series color",
        "description": "The color of the borders. Optional. The default is no color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.set_border_width",
    "namespace": "table",
    "syntax": "table.set_border_width(table_id, border_width) → void",
    "description": "The function sets the width of the borders (excluding the outer frame) of the table's cells.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "border_width",
        "type": "series int",
        "description": "The width of the borders. Optional. The default is 0.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.set_frame_color",
    "namespace": "table",
    "syntax": "table.set_frame_color(table_id, frame_color) → void",
    "description": "The function sets the color of the outer frame of a table.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "frame_color",
        "type": "series color",
        "description": "The color of the frame of the table. Optional. The default is no color.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.set_frame_width",
    "namespace": "table",
    "syntax": "table.set_frame_width(table_id, frame_width) → void",
    "description": "The function set the width of the outer frame of a table.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "frame_width",
        "type": "series int",
        "description": "The width of the outer frame of the table. Optional. The default is 0.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "table.set_position",
    "namespace": "table",
    "syntax": "table.set_position(table_id, position) → void",
    "description": "The function sets the position of a table.",
    "parameters": [
      {
        "name": "table_id",
        "type": "series table",
        "description": "A table object.",
        "required": false
      },
      {
        "name": "position",
        "type": "series string",
        "description": "Position of the table. Possible values are: position.top_left, position.top_center, position.top_right, position.middle_left, position.middle_center, position.middle_right, position.bottom_left, position.bottom_center, position.bottom_right.",
        "required": false
      }
    ],
    "returns": "void",
    "example": ""
  },
  {
    "name": "ticker.heikinashi",
    "namespace": "ticker",
    "syntax": "ticker.heikinashi(symbol) → simple string",
    "description": "Creates a ticker identifier for requesting Heikin Ashi bar values.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol ticker identifier.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.heikinashi\", overlay=true)heikinashi_close = request.security(ticker.heikinashi(syminfo.tickerid), timeframe.period, close)heikinashi_aapl_60_close = request.security(ticker.heikinashi(\"AAPL\"), \"60\", close)plot(heikinashi_close)plot(heikinashi_aapl_60_close)"
  },
  {
    "name": "ticker.inherit",
    "namespace": "ticker",
    "syntax": "ticker.inherit(from_tickerid, symbol) → simple string",
    "description": "Constructs a ticker ID for the specified symbol with additional parameters inherited from the ticker ID passed into the function call, allowing the script to request a symbol's data using the same modifiers that the from_tickerid has, including extended session, dividend adjustment, currency conversion, non-standard chart types, back-adjustment, settlement-as-close, etc.",
    "parameters": [
      {
        "name": "from_tickerid",
        "type": "simple string",
        "description": "The ticker ID to inherit modifiers from.",
        "required": false
      },
      {
        "name": "symbol",
        "type": "simple string",
        "description": "The symbol to construct the new ticker ID for.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.inherit\")//@variable A \"NASDAQ:AAPL\" ticker ID with Extender Hours enabled.tickerExtHours = ticker.new(\"NASDAQ\", \"AAPL\", session.extended)//@variable A Heikin Ashi ticker ID for \"NASDAQ:AAPL\" with Extended Hours enabled.HAtickerExtHours = ticker.heikinashi(tickerExtHours)//@variable The \"NASDAQ:MSFT\" symbol with no modifiers.testSymbol = \"NASDAQ:MSFT\"//@variable A ticker ID for \"NASDAQ:MSFT\" with inherited Heikin Ashi and Extended Hours modifiers.testSymbolHAtickerExtHours = ticker.inherit(HAtickerExtHours, testSymbol)//@variable The `close` price requested using \"NASDAQ:MSFT\" with inherited modifiers.secData = request.security(testSymbolHAtickerExtHours, \"60\", close, ignore_invalid_symbol = true)//@variable The `close` price requested using \"NASDAQ:MSFT\" without modifiers.compareData = request.security(testSymbol, \"60\", close, ignore_invalid_symbol = true)plot(secData, color = color.green)plot(compareData)"
  },
  {
    "name": "ticker.kagi",
    "namespace": "ticker",
    "syntax": "ticker.kagi(symbol, reversal) → simple string",
    "description": "Creates a ticker identifier for requesting Kagi values.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol ticker identifier.",
        "required": false
      },
      {
        "name": "reversal",
        "type": "simple int/float",
        "description": "Reversal amount (absolute price value).",
        "required": false
      },
      {
        "name": "param",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "style",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.kagi\", overlay=true)kagi_tickerid = ticker.kagi(syminfo.tickerid, 3)kagi_close = request.security(kagi_tickerid, timeframe.period, close)plot(kagi_close)"
  },
  {
    "name": "ticker.linebreak",
    "namespace": "ticker",
    "syntax": "ticker.linebreak(symbol, number_of_lines) → simple string",
    "description": "Creates a ticker identifier for requesting Line Break values.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol ticker identifier.",
        "required": false
      },
      {
        "name": "number_of_lines",
        "type": "simple int",
        "description": "Number of line.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.linebreak\", overlay=true)linebreak_tickerid = ticker.linebreak(syminfo.tickerid, 3)linebreak_close = request.security(linebreak_tickerid, timeframe.period, close)plot(linebreak_close)"
  },
  {
    "name": "ticker.modify",
    "namespace": "ticker",
    "syntax": "ticker.modify(tickerid, session, adjustment, backadjustment, settlement_as_close) → simple string",
    "description": "Creates a ticker identifier for requesting additional data for the script.",
    "parameters": [
      {
        "name": "tickerid",
        "type": "simple string",
        "description": "Symbol name with exchange prefix, e.g. 'BATS:MSFT', 'NASDAQ:MSFT' or tickerid with session and adjustment from the ticker.new() function.",
        "required": false
      },
      {
        "name": "session",
        "type": "simple string",
        "description": "Session type. Optional argument. Possible values: session.regular, session.extended. Session type of the current chart is syminfo.session. If session is not given, then syminfo.session value is used.",
        "required": false
      },
      {
        "name": "adjustment",
        "type": "simple string",
        "description": "Adjustment type. Optional argument. Possible values: adjustment.none, adjustment.splits, adjustment.dividends. If adjustment is not given, then default adjustment value is used (can be different depending on particular instrument).",
        "required": false
      },
      {
        "name": "backadjustment",
        "type": "simple backadjustment",
        "description": "Specifies whether past contract data on continuous futures symbols is back-adjusted. This setting only affects the data from symbols with this option available on their charts. Optional. The default is backadjustment.inherit, meaning that the modified ticker ID inherits the setting from the ticker ID passed to the tickerid parameter, or it inherits the symbol's default if the tickerid does not specify this setting. Possible values: backadjustment.inherit, backadjustment.on, backadjustment.off.",
        "required": false
      },
      {
        "name": "settlement_as_close",
        "type": "simple settlement",
        "description": "Specifies whether a futures symbol's close value represents the actual closing price or the settlement price on \"1D\" and higher timeframes. This setting only affects the data from symbols with this option available on their charts. Optional. The default is settlement_as_close.inherit, meaning that the modified ticker ID inherits the setting from the tickerid passed into the function, or it inherits the chart symbol's default if the tickerid does not specify this setting. Possible values: settlement_as_close.inherit, settlement_as_close.on, settlement_as_close.off.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker_modify\", overlay=true)t1 = ticker.new(syminfo.prefix, syminfo.ticker, session.regular, adjustment.splits)c1 = request.security(t1, \"D\", close)t2 = ticker.modify(t1, session.extended)c2 = request.security(t2, \"2D\", close)plot(c1)plot(c2)"
  },
  {
    "name": "ticker.new",
    "namespace": "ticker",
    "syntax": "ticker.new(prefix, ticker, session, adjustment, backadjustment, settlement_as_close) → simple string",
    "description": "Creates a ticker identifier for requesting additional data for the script.",
    "parameters": [
      {
        "name": "prefix",
        "type": "simple string",
        "description": "Exchange prefix. For example: 'BATS', 'NYSE', 'NASDAQ'. Exchange prefix of main series is syminfo.prefix.",
        "required": false
      },
      {
        "name": "ticker",
        "type": "simple string",
        "description": "Ticker name. For example 'AAPL', 'MSFT', 'EURUSD'. Ticker name of the main series is syminfo.ticker.",
        "required": false
      },
      {
        "name": "session",
        "type": "simple string",
        "description": "Session type. Optional argument. Possible values: session.regular, session.extended. Session type of the current chart is syminfo.session. If session is not given, then syminfo.session value is used.",
        "required": false
      },
      {
        "name": "adjustment",
        "type": "simple string",
        "description": "Adjustment type. Optional argument. Possible values: adjustment.none, adjustment.splits, adjustment.dividends. If adjustment is not given, then default adjustment value is used (can be different depending on particular instrument).",
        "required": false
      },
      {
        "name": "backadjustment",
        "type": "simple backadjustment",
        "description": "Specifies whether past contract data on continuous futures symbols is back-adjusted. This setting only affects the data from symbols with this option available on their charts. Optional. The default is backadjustment.inherit, meaning that the new ticker ID inherits the symbol's default setting. Possible values: backadjustment.inherit, backadjustment.on, backadjustment.off.",
        "required": false
      },
      {
        "name": "settlement_as_close",
        "type": "simple settlement",
        "description": "Specifies whether a futures symbol's close value represents the actual closing price or the settlement price on \"1D\" and higher timeframes. This setting only affects the data from symbols with this option available on their charts. Optional. The default is settlement_as_close.inherit, meaning that the new ticker ID inherits the chart symbol's default setting. Possible values: settlement_as_close.inherit, settlement_as_close.on, settlement_as_close.off.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.new\", overlay=true)t = ticker.new(syminfo.prefix, syminfo.ticker, session.regular, adjustment.splits)t2 = ticker.heikinashi(t)c = request.security(t2, timeframe.period, low, barmerge.gaps_on)plot(c, style=plot.style_linebr)"
  },
  {
    "name": "ticker.pointfigure",
    "namespace": "ticker",
    "syntax": "ticker.pointfigure(symbol, source, style, param, reversal) → simple string",
    "description": "Creates a ticker identifier for requesting Point & Figure values.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol ticker identifier.",
        "required": false
      },
      {
        "name": "source",
        "type": "simple string",
        "description": "The source for calculating Point & Figure. Possible values are: 'hl', 'close'.",
        "required": false
      },
      {
        "name": "style",
        "type": "simple string",
        "description": "Specifies the ticker's box size assignment method. Possible values: \"ATR\" for Average True Range sizing, \"Traditional\" to use a fixed size, or \"PercentageLTP\" to use a percentage of the last trading price.",
        "required": false
      },
      {
        "name": "param",
        "type": "simple int/float",
        "description": "Represents the ticker's \"ATR length\" value if the style value is \"ATR\", \"Box size\" value if the style is \"Traditional\", or \"Percentage\" value if the style is \"PercentageLTP\".",
        "required": false
      },
      {
        "name": "reversal",
        "type": "simple int",
        "description": "Reversal amount.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.pointfigure\", overlay=true)pnf_tickerid = ticker.pointfigure(syminfo.tickerid, \"hl\", \"Traditional\", 1, 3)pnf_close = request.security(pnf_tickerid, timeframe.period, close)plot(pnf_close)"
  },
  {
    "name": "ticker.renko",
    "namespace": "ticker",
    "syntax": "ticker.renko(symbol, style, param, request_wicks, source) → simple string",
    "description": "Creates a ticker identifier for requesting Renko values.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "Symbol ticker identifier.",
        "required": false
      },
      {
        "name": "style",
        "type": "simple string",
        "description": "Specifies the ticker's box size assignment method. Possible values: \"ATR\" for Average True Range sizing, \"Traditional\" to use a fixed size, or \"PercentageLTP\" to use a percentage of the last trading price.",
        "required": false
      },
      {
        "name": "param",
        "type": "simple int/float",
        "description": "Represents the ticker's \"ATR length\" value if the style value is \"ATR\", \"Box size\" value if the style is \"Traditional\", or \"Percentage\" value if the style is \"PercentageLTP\".",
        "required": false
      },
      {
        "name": "request_wicks",
        "type": "simple bool",
        "description": "Specifies if wick values are returned for Renko bricks. When true, high and low values requested from a symbol using the ticker formed by this function will include wick values when they are present. When false, high and low will always be equal to either open or close. Optional. The default is false. A detailed explanation of how Renko wicks are calculated can be found in our Help Center.",
        "required": false
      },
      {
        "name": "source",
        "type": "simple string",
        "description": "The source used to calculate bricks. Optional. Possible values: \"Close\", \"OHLC\". The default is \"Close\".",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.renko\", overlay=true)renko_tickerid = ticker.renko(syminfo.tickerid, \"ATR\", 10)renko_close = request.security(renko_tickerid, timeframe.period, close)plot(renko_close)"
  },
  {
    "name": "ticker.standard",
    "namespace": "ticker",
    "syntax": "ticker.standard(symbol) → simple string",
    "description": "Creates a ticker to request data from a standard chart that is unaffected by modifiers like extended session, dividend adjustment, currency conversion, and the calculations of non-standard chart types: Heikin Ashi, Renko, etc. Among other things, this makes it possible to retrieve standard chart values when the script is running on a non-standard chart.",
    "parameters": [
      {
        "name": "symbol",
        "type": "simple string",
        "description": "A ticker ID to be converted into its standard form. Optional. The default is syminfo.tickerid.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"ticker.standard\", overlay = true)// This script should be run on a non-standard chart such as HA, Renko...// Requests data from the chart type the script is running on.chartTypeValue = request.security(syminfo.tickerid, \"1D\", close)// Request data from the standard chart type, regardless of the chart type the script is running on.standardChartValue = request.security(ticker.standard(syminfo.tickerid), \"1D\", close)// This will not use a standard ticker ID because the `symbol` argument contains only the ticker — not the prefix (exchange).standardChartValue2 = request.security(ticker.standard(syminfo.ticker), \"1D\", close)plot(chartTypeValue)plot(standardChartValue, color = color.green)"
  },
  {
    "name": "time",
    "syntax": "time(timeframe, session, bars_back, timeframe_bars_back) → series int",
    "description": "Returns the opening UNIX timestamp for the specified timeframe and session, or na if the time point is outside the session.",
    "parameters": [
      {
        "name": "timeframe",
        "type": "series string",
        "description": "The timeframe of the timestamp calculation. If the value is an empty string, the function uses the script's main timeframe.",
        "required": false
      },
      {
        "name": "session",
        "type": "series string",
        "description": "Optional. The session string for filtering times. The function returns a timestamp if the time is in the specified session, or na if the time is outside the session. If the argument is an empty string, the function uses the default, which is the symbol's session.",
        "required": false
      },
      {
        "name": "bars_back",
        "type": "series int",
        "description": "Optional. The bar offset on the script's main timeframe. If the value is positive, the function finds the bar that is N bars before the current bar on the main timeframe, then retrieves the timestamp of the corresponding bar on the timeframe specified by the timeframe argument. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar corresponding to N bars after the current bar on the main timeframe. The default is 0.",
        "required": false
      },
      {
        "name": "timeframe_bars_back",
        "type": "series int",
        "description": "Optional. The additional bar offset on the timeframe specified by the timeframe argument. If the value is positive, the function retrieves the timestamp of the bar that is N timeframe bars before the one corresponding to the bars_back offset. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar that is N timeframe bars after the one corresponding to the bars_back offset. The default is 0.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"Time\", overlay=true)// Try this on chart AAPL,1timeinrange(res, sess) => not na(time(res, sess, \"America/New_York\")) ? 1 : 0plot(timeinrange(\"1\", \"1300-1400\"), color=color.red)// This plots 1.0 at every start of 10 minute bar on a 1 minute chart:newbar(res) => ta.change(time(res)) == 0 ? 0 : 1plot(newbar(\"10\"))"
  },
  {
    "name": "time_close",
    "syntax": "time_close(timeframe, session, bars_back, timeframe_bars_back) → series int",
    "description": "Returns the closing UNIX timestamp for the specified timeframe and session, or na if the time point is outside the session. On tick charts and price-based charts such as Renko, line break, Kagi, point & figure, and range, the function returns na on the latest realtime bar because the future closing time is unpredictable. However, it returns a valid timestamp for any previous bar.",
    "parameters": [
      {
        "name": "timeframe",
        "type": "series string",
        "description": "The timeframe of the timestamp calculation. If the value is an empty string, the function uses the script's main timeframe.",
        "required": false
      },
      {
        "name": "session",
        "type": "series string",
        "description": "Optional. The session string for filtering times. The function returns a timestamp if the time is in the specified session, or na if the time is outside the session. If the argument is an empty string, the function uses the default, which is the symbol's session.",
        "required": false
      },
      {
        "name": "bars_back",
        "type": "series int",
        "description": "Optional. The bar offset on the script's main timeframe. If the value is positive, the function finds the bar that is N bars before the current bar on the main timeframe, then retrieves the timestamp of the corresponding bar on the timeframe specified by the timeframe argument. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar corresponding to N bars after the current bar on the main timeframe. The default is 0.",
        "required": false
      },
      {
        "name": "timeframe_bars_back",
        "type": "series int",
        "description": "Optional. The additional bar offset on the timeframe specified by the timeframe argument. If the value is positive, the function retrieves the timestamp of the bar that is N timeframe bars before the one corresponding to the bars_back offset. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar that is N timeframe bars after the one corresponding to the bars_back offset. The default is 0.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "series int",
    "example": "//@version=6indicator(\"Time\", overlay=true)t1 = time_close(timeframe.period, \"1200-1300\", \"America/New_York\")bgcolor(not na(t1) ? color.new(color.blue, 90) : na)"
  },
  {
    "name": "timeframe.change",
    "namespace": "timeframe",
    "syntax": "timeframe.change(timeframe) → series bool",
    "description": "Detects changes in the specified timeframe.",
    "parameters": [
      {
        "name": "timeframe",
        "type": "series string",
        "description": "String formatted according to the User manual's timeframe string specifications.",
        "required": false
      }
    ],
    "returns": "series bool",
    "example": "//@version=6// Run this script on an intraday chart.indicator(\"New day started\", overlay = true)// Highlights the first bar of the new day.isNewDay = timeframe.change(\"1D\")bgcolor(isNewDay ? color.new(color.green, 80) : na)"
  },
  {
    "name": "timeframe.from_seconds",
    "namespace": "timeframe",
    "syntax": "timeframe.from_seconds(seconds) → simple string",
    "description": "Converts a number of seconds into a valid timeframe string.",
    "parameters": [
      {
        "name": "seconds",
        "type": "simple int",
        "description": "The number of seconds in the timeframe.",
        "required": false
      }
    ],
    "returns": "simple string",
    "example": "//@version=6indicator(\"HTF Close\", \"\", true)int chartTf = timeframe.in_seconds()string tfTimes5 = timeframe.from_seconds(chartTf * 5)float htfClose = request.security(syminfo.tickerid, tfTimes5, close)plot(htfClose)"
  },
  {
    "name": "timeframe.in_seconds",
    "namespace": "timeframe",
    "syntax": "timeframe.in_seconds(timeframe) → simple int",
    "description": "Converts a timeframe string into seconds.",
    "parameters": [
      {
        "name": "timeframe",
        "type": "simple string",
        "description": "Timeframe string in timeframe string specifications format. Optional. The default is timeframe.period.",
        "required": false
      }
    ],
    "returns": "simple int",
    "example": "//@version=6indicator(\"`timeframe_in_seconds()`\"),// Get a user-selected timeframe.tfInput = input.timeframe(\"1D\")// Convert it into an \"int\" number of seconds.secondsInTf = timeframe.in_seconds(tfInput)plot(secondsInTf)"
  },
  {
    "name": "timestamp",
    "syntax": "timestamp(dateString) → const int",
    "description": "Function timestamp returns UNIX time of specified date and time.",
    "parameters": [
      {
        "name": "dateString",
        "type": "const string",
        "description": "A string containing the date and, optionally, the time and time zone. Its format must comply with either the IETF RFC 2822 or ISO 8601 standards (\"DD MMM YYYY hh:mm:ss ±hhmm\" or \"YYYY-MM-DDThh:mm:ss±hh:mm\", so \"20 Feb 2020\" or \"2020-02-20\"). If no time is supplied, \"00:00\" is used. If no time zone is supplied, GMT+0 will be used. Note that this diverges from the usual behavior of the function where it returns time in the exchange's timezone.",
        "required": false
      },
      {
        "name": "year",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "month",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "day",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "hour",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "minute",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "second",
        "type": "unknown",
        "description": "",
        "required": false
      },
      {
        "name": "timezone",
        "type": "unknown",
        "description": "",
        "required": false
      }
    ],
    "returns": "const int",
    "example": "//@version=6indicator(\"timestamp\")plot(timestamp(2016, 01, 19, 09, 30), linewidth=3, color=color.green)plot(timestamp(syminfo.timezone, 2016, 01, 19, 09, 30), color=color.blue)plot(timestamp(2016, 01, 19, 09, 30), color=color.yellow)plot(timestamp(\"GMT+6\", 2016, 01, 19, 09, 30))plot(timestamp(2019, 06, 19, 09, 30, 15), color=color.lime)plot(timestamp(\"GMT+3\", 2019, 06, 19, 09, 30, 15), color=color.fuchsia)plot(timestamp(\"Feb 01 2020 22:10:05\"))plot(timestamp(\"2011-10-10T14:48:00\"))plot(timestamp(\"04 Dec 1995 00:12:00 GMT+5\"))"
  },
  {
    "name": "weekofyear",
    "syntax": "weekofyear(time, timezone) → series int",
    "description": "Calculates the week number of the year, in a specified time zone, from a UNIX timestamp.",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "A UNIX timestamp in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Optional. Specifies the time zone of the returned week number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  },
  {
    "name": "year",
    "syntax": "year(time, timezone) → series int",
    "description": "",
    "parameters": [
      {
        "name": "time",
        "type": "series int",
        "description": "UNIX time in milliseconds.",
        "required": false
      },
      {
        "name": "timezone",
        "type": "series string",
        "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
        "required": false
      }
    ],
    "returns": "series int",
    "example": ""
  }
];

/**
 * Functions indexed by name for O(1) lookup
 */
export const FUNCTIONS_BY_NAME: Map<string, PineFunction> = new Map(
	FUNCTIONS.map(f => [f.name, f])
);

/**
 * Functions grouped by namespace
 */
export const FUNCTIONS_BY_NAMESPACE: Map<string, PineFunction[]> = (() => {
	const map = new Map<string, PineFunction[]>();
	for (const f of FUNCTIONS) {
		const ns = f.namespace || "_global";
		if (!map.has(ns)) map.set(ns, []);
		map.get(ns)!.push(f);
	}
	return map;
})();

/**
 * All function names as a Set for fast membership check
 */
export const FUNCTION_NAMES: Set<string> = new Set(FUNCTIONS.map(f => f.name));

/**
 * All namespace names that have functions
 */
export const FUNCTION_NAMESPACES: Set<string> = new Set(
	FUNCTIONS.filter(f => f.namespace).map(f => f.namespace!)
);
