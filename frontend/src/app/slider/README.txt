Heavily adapted from https://github.com/Bogdan1975/ng2-slider-component

Simply running `npm install ng2-slider-component` and using the component as is is not viable because:
 a) the component is incorrectly packaged for webpack
 b) I have more stringent type-checking than Bogdan1975, had to add lots of explicit "any" and "any[]" type annotations
 c) it lacks comprehensive output events that I can track
 d) the styling part was generally a mess for what I need (ripped it all out, fixed style of slider in component definition)
 e) I want to have a base on which to build mini-histograms later, if time permits

Original license follows:

The MIT License (MIT)

Copyright (c) 2016 Bogdan1975

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
