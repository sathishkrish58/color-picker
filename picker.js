(function (global) {

    class ColorPicker {
        constructor() {
            this.color = { hue: 0, opacity: 1, hex: "#FFFFFF" };
            this.predefinedColors = [
                '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
                '#00ffff', '#000000', '#f5b4b4', '#800000', '#808000',
                '#008000', '#800080', '#008080', '#c0c0c0', '#ffa500',
                '#a52a2a', '#8a2be2', '#5f9ea0'
            ];

            this.addHTML();
            this.init();
        }

        addHTML() {
            const htmlString =

                `<div id="color-picker-dialog" class="color-picker-container">
    <div class="color-palette" id="color-palette">
        <div class="color-palette-dragger" id="color-palette-dragger"></div>
    </div>
    <div class="rgb-slider" id="rgb-slider">
        <div class="dragger" id="rgb-dragger"></div>
    </div>
    <div class="opacity-slider" id="opacity-slider">
        <div class="dragger" id="opacity-dragger"></div>
    </div>

    <div class="predefined-colors" id="predefined-colors"></div>

    <div class="color-info">
        <input class="hex-value" type="text" id="hex-value" value="#FFFFFF">
        <div class="color-round" id="color-round"></div>
        <button id="save-button" class="save-button">Save</button>
    </div>
</div>`;

            document.body.insertAdjacentHTML('beforeend', htmlString);

        }

        init() {
            this.colorPickerDialog = document.getElementById('color-picker-dialog');
            this.colorPalette = document.getElementById("color-palette");
            this.rgbSlider = document.getElementById("rgb-slider");
            this.opacitySlider = document.getElementById("opacity-slider");
            this.rgbDragger = document.getElementById("rgb-dragger");
            this.opacityDragger = document.getElementById("opacity-dragger");
            this.hexInput = document.getElementById("hex-value");
            this.colorRound = document.getElementById("color-round");
            this.paletteDragger = document.getElementById("color-palette-dragger");
            this.predefinedColorsContainer = document.getElementById('predefined-colors');
            this.saveButton = document.getElementById('save-button');

            this.populatePredefinedColors();
            this.attachEventListeners();
            this.isRGBDragger = false;
            this.isOpacityDragger = false;
            this.isPaletteDragger = false;
        }

        populatePredefinedColors() {
            this.predefinedColors.forEach(colorCode => {
                const colorDiv = document.createElement('div');
                colorDiv.style.backgroundColor = colorCode;
                colorDiv.className = 'predefined-color';
                colorDiv.onclick = () => {

                    const inputHue = this.hexaToHsl(colorCode);
                    this.color.hue = inputHue.h;
                    this.color.saturation = inputHue.s
                    this.color.lightness = inputHue.l
        
                    this.updateColorPalette();
                    this.updateOpacityDisplay();
                    this.updateRGBDraggerPosition();
                };
                this.predefinedColorsContainer.appendChild(colorDiv);
            });
        }

        attachEventListeners() {
            const _this = this;

            // Click event for rgb-slider
            this.rgbSlider.addEventListener("click", (event) => {
                this.rgbSliderHandler(event);
            });

            // RGB slider drag functionality
            this.rgbDragger.addEventListener("mousedown", (event) => {
                this.isRGBDragger = true;

                document.addEventListener("mousemove", this.rgbDraggerHandler.bind(this));
                document.addEventListener("mouseup", () => {
                    if (!this.isRGBDragger) return;

                    this.isRGBDragger = false;
                    document.removeEventListener("mousemove", this.rgbDraggerHandler.bind(this));
                });
            });




            // Click event for opacity-slider
            this.opacitySlider.addEventListener("click", (event) => {
                this.opacitySliderHandler(event);
            });

            // Dragger-specific mousedown event for opacity-dragger
            this.opacityDragger.addEventListener("mousedown", (event) => {
                event.stopPropagation(); // Prevent conflict with slider mousedown
                this.isOpacityDragger = true;
                document.addEventListener("mousemove", this.opacityDraggerHandler.bind(this));
                document.addEventListener("mouseup", () => {
                    if (!this.isOpacityDragger) return;

                    this.isOpacityDragger = false;
                    document.removeEventListener("mousemove", this.opacityDraggerHandler.bind(this));
                });
            });


             // Dragger-specific mousedown event for opacity-dragger
             this.paletteDragger.addEventListener("mousedown", (event) => {
                event.stopPropagation(); // Prevent conflict with slider mousedown
                this.isPaletteDragger = true;
                document.addEventListener("mousemove", this.paletteDraggerHandler.bind(this));
                document.addEventListener("mouseup", () => {
                    if (!this.isPaletteDragger) return;

                    this.isPaletteDragger = false;
                    document.removeEventListener("mousemove", this.paletteDraggerHandler.bind(this));
                });
            });


            this.colorPalette.addEventListener('click', (e) =>{
                const rect = this.colorPalette.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.moveDragger(x, y);
                this.updateColorFromDragger(e.clientX, e.clientY);
            });

            this.hexInput.addEventListener("input", this.updateHexFromInput.bind(this));

            this.saveButton.addEventListener('click', (e) => {
                this.updateReferenceElementValue();
                this.colorPickerDialog.style.display = 'none';
            })


            // Close the dialog when clicking outside
            document.addEventListener('click', function (event) {

                const refElem = event.target.closest('[data-color-picker]')
                if (!_this.colorPickerDialog.contains(event.target) && refElem !== _this.referenceElement) {
                    _this.colorPickerDialog.style.display = 'none';

                }

                if (_this.referenceElement && !refElem) {
                    const colorInput = _this.referenceElement.querySelector('input');
                    // colorInput.disabled = false;
                    //     _this.referenceElement = null;
                }
            });
        }

        updateReferenceElementValue() {
            const colorInput = this.referenceElement.querySelector('input');
            const colorpreview = this.referenceElement.querySelector('[data-color-preview]');
            colorInput.value = this.color.hex.toUpperCase();
            // colorInput.disabled = false;
            if (colorpreview) {
                colorpreview.style.backgroundColor = this.color.hex;
            }


        }

        updateColorPalette() {
            const paletteOpacity = 1;
            this.colorPalette.style.background = `linear-gradient(to top, rgba(0, 0, 0, ${paletteOpacity}), transparent),
                linear-gradient(to left, hsla(${this.color.hue}, 100%, 50%, ${paletteOpacity}), white)`;

            const rect = this.colorPalette.getBoundingClientRect();
            const xPos = (this.color.saturation / 100) * rect.width; // Horizontal position based on saturation
            const yPos = (1 - this.color.lightness / 100) * rect.height; // Vertical position based on lightness
              
            this.paletteDragger.style.left = `${xPos}px`;
            this.paletteDragger.style.top = `${yPos}px`;
        }


        rgbSliderHandler(event) {

            const rect = this.rgbSlider.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
            const hue = (x / rect.width) * 360;

            this.color.hue = hue;
            this.rgbDragger.style.left = `${(x / rect.width) * 100}%`;

            this.updateColorPalette();
            this.updateColorDisplay(this.hslToHex(this.color.hue, 100, 50));
            this.updateOpacityColor();
        }

        updateRGBDraggerPosition() {
            const rect = this.rgbSlider.getBoundingClientRect();
            const draggerPosition = (this.color.hue / 360) * rect.width;  // Proportional position based on hue value
            this.rgbDragger.style.left = `${draggerPosition}px`;
        }

        rgbDraggerHandler(event) {
            if (!this.isRGBDragger) return;
            this.rgbSliderHandler(event);
        }

        opacityDraggerHandler(event) {
            if (!this.isOpacityDragger) return;
            this.opacitySliderHandler(event);
        }

        opacitySliderHandler(event) {
            const rect = this.opacitySlider.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
            const opacity = x / rect.width;
            this.color.opacity = opacity;
            this.updateOpacityDisplay();
        }

        paletteDraggerHandler(e) {
            if(!this.isPaletteDragger) return;

            const rect = this.colorPalette.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.moveDragger(x, y);
            this.updateColorFromDragger(e.clientX, e.clientY); 
            this.updateOpacityColor();
        }

        moveDragger = (x, y) => {
            this.paletteDragger.style.left = `${x}px`;
            this.paletteDragger.style.top = `${y}px`;
        };

        updateColorFromDragger = (xRatio, yRatio) => {

            const rect = this.colorPalette.getBoundingClientRect();
            const x = xRatio - rect.left;
            const y = yRatio - rect.top;

            const saturation = (x / rect.width) * 100; // Horizontal axis for saturation
            const lightness = 100 - (y / rect.height) * 100; // Vertical axis for lightness

            this.color.saturation = saturation;
            this.color.lightness = lightness;

            const hexColor = this.hslToHex(this.color.hue, saturation, lightness);
            this.updateColorDisplay(hexColor);
        };

        updateColorFromClick(event) {

            const rect = this.colorPalette.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const saturation = (x / rect.width) * 100;
            const brightness = 100 - (y / rect.height) * 100;

            this.paletteDragger.style.left = `${this.color.opacity * 100}%`;

            const hslColor = `hsl(${this.color.hue}, ${saturation}%, ${brightness}%)`;
            const hexColor = this.hslToHex(this.color.hue, saturation, brightness);

            this.updateColorDisplay(hexColor);
        }

        updateHexFromInput() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.hexInput.value)) {
                this.color.hex = this.hexInput.value;
                this.colorRound.style.backgroundColor = this.color.hex;
            }
        }

        updateColorDisplay(hex) {

            const opacityHex = Math.round(this.color.opacity * 255).toString(16).padStart(2, '0').toUpperCase(); // 
            // Convert to 16-bit hex
            let hexValue = hex;
            if (/^#[0-9A-Fa-f]{8}$/.test(hexValue)) {
                // Replace last two characters if hex contains opacity
                if (opacityHex === 'FF') {
                    // Remove opacity if it's FF
                    hexValue = hexValue.slice(0, 7);
                } else {
                    hexValue = hexValue.slice(0, 7) + opacityHex;
                }
            } else if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                if (opacityHex !== 'FF') {
                    // Append opacity only if it's not FF
                    hexValue = hexValue + opacityHex;
                }
            }

            this.color.hex = hexValue;
            this.hexInput.value = hexValue.toUpperCase();
            this.colorRound.style.backgroundColor = hexValue;
        }

        updateOpacityColor() {
            this.opacitySlider.style.background = `linear-gradient(to right, rgba(0, 0, 0, 0), hsla(${this.color.hue}, 100%, 50%, 1)`;
        }

        updateOpacityDisplay() {
            this.opacityDragger.style.left = `${this.color.opacity * 100}%`;
            let hexValue = this.color.hex;
           
            this.updateOpacityColor();
            this.updateColorDisplay(hexValue);
        }

        hslToHex(h, s, l) {
            s /= 100;
            l /= 100;

            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

            const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');

            return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
        }

        // Helper functions for color conversion
        hexaToHsl = (hex) => {
            const shorthandRegex = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d]?)$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b, a) => r + r + g + g + b + b + (a ? a + a : ''));
        
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
            const rgb = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a: result[4] ? parseInt(result[4], 16) / 255 : 1
            } : null;

            this.color.opacity = rgb.a;
            return this.rgbToHsl(rgb)
        };

        rgbToHsl = ({r, g, b}) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        };


        showDialog(refElem) {
            if (!refElem.hasAttribute('data-color-picker')) {
                return;
            }

            this.referenceElement = refElem;
            const colorInput = refElem.querySelector('input');
            const inputHue = this.hexaToHsl(colorInput.value);

            this.color.hex = colorInput.value;
            this.color.hue = inputHue.h;
            this.color.saturation = inputHue.s
            this.color.lightness = inputHue.l

            const rect = refElem.getBoundingClientRect();
            this.colorPickerDialog.style.top = `${rect.bottom + 4}px`;
            this.colorPickerDialog.style.left = rect.left + 'px';
            this.colorPickerDialog.style.display = 'flex';

            this.updateOpacityDisplay();
            this.updateColorPalette();
            this.updateRGBDraggerPosition();

        }
    }

    global.colorPicker = new ColorPicker();

})(window)
