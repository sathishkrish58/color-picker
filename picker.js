( function(global){

    class ColorPicker {
        constructor() {
            this.color = { hue: 0, opacity: 1, hex: "#FFFFFF" };
            this.predefinedColors = [
                '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
                '#00ffff', '#000000', '#fff2f2', '#800000', '#808000',
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
        }
    
        populatePredefinedColors() {
            this.predefinedColors.forEach(colorCode => {
                const colorDiv = document.createElement('div');
                colorDiv.style.backgroundColor = colorCode;
                colorDiv.className = 'predefined-color';
                colorDiv.onclick = () => this.updateColorDisplay(colorCode);
                this.predefinedColorsContainer.appendChild(colorDiv);
            });
        }
    
        setDefaultValues() {
            this.updateOpacityDisplay();
            this.updateColorPalette();
        }
    
        attachEventListeners() {
            const _this = this;
    
            // RGB slider drag functionality
            this.rgbSlider.addEventListener("mousedown", (event) => {
                this.rgbSliderHandler(event); // Handle initial click
                document.addEventListener("mousemove", this.rgbSliderHandler.bind(this));
                document.addEventListener("mouseup", () => {
                    document.removeEventListener("mousemove", this.rgbSliderHandler.bind(this));
                });
            });
    
    
            // Click event for opacity-slider
            this.opacitySlider.addEventListener("click", (event) => {
                this.opacitySliderHandler(event);
            });
    
            // Dragger-specific mousedown event for opacity-dragger
            this.opacityDragger.addEventListener("mousedown", (event) => {
                event.stopPropagation(); // Prevent conflict with slider mousedown
                document.addEventListener("mousemove", this.opacitySliderHandler.bind(this));
                document.addEventListener("mouseup", () => {
                    document.removeEventListener("mousemove", this.opacitySliderHandler.bind(this));
                });
            });
    
            this.colorPalette.addEventListener('click', this.updateColorFromClick.bind(this));
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

                if(_this.referenceElement && !refElem) {
                    const colorInput = _this.referenceElement.querySelector('input');
                    colorInput.disabled = false;
               //     _this.referenceElement = null;
                }
            });
        }

        updateReferenceElementValue() {
            const colorInput = this.referenceElement.querySelector('input');
            const colorpreview = this.referenceElement.querySelector('[data-color-preview]');
            colorInput.value = this.color.hex.toUpperCase();
            colorInput.disabled = false;
            if(colorpreview) {
                colorpreview.style.backgroundColor = this.color.hex;
            }


        }
    
        updateColorPalette() {
            const paletteOpacity = 1;
            this.colorPalette.style.background = `linear-gradient(to top, rgba(0, 0, 0, ${paletteOpacity}), transparent),
                linear-gradient(to left, hsla(${this.color.hue}, 100%, 50%, ${paletteOpacity}), white)`;
        }
    
        rgbSliderHandler(event) {
            const rect = this.rgbSlider.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
            const hue = (x / rect.width) * 360;
    
            this.color.hue = hue;
            this.rgbDragger.style.left = `${(x / rect.width) * 100}%`;
    
            this.updateColorPalette();
            this.updateColorDisplay(this.hslToHex(this.color.hue, 100, 50));
        }
    
        opacitySliderHandler(event) {
            const rect = this.opacitySlider.getBoundingClientRect();
            const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
            const opacity = x / rect.width;
    
            this.color.opacity = opacity;
    
            this.updateOpacityDisplay();
        }
    
        updateColorFromClick(event) {
            const rect = this.colorPalette.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
    
            const saturation = (x / rect.width) * 100;
            const brightness = 100 - (y / rect.height) * 100;
    
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
            this.color.hex = hex;
            this.hexInput.value = hex.toUpperCase();
            this.colorRound.style.backgroundColor = hex;
        }
    
        updateOpacityDisplay() {
            this.opacityDragger.style.left = `${this.color.opacity * 100}%`;
            const opacityHex = Math.round(this.color.opacity * 255).toString(16).padStart(2, '0').toUpperCase(); // 
            // Convert to 16-bit hex
    
            let hexValue = this.color.hex;
            if (/^#[0-9A-Fa-f]{8}$/.test(hexValue)) {
                // Replace last two characters if hex contains opacity
                if (opacityHex === 'FF' || opacityHex === '00') {
                    // Remove opacity if it's FF
                    hexValue = hexValue.slice(0, 7);
                } else {
                    hexValue = hexValue.slice(0, 7) + opacityHex;
                }
            } else if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                if (opacityHex !== 'FF' && opacityHex !== '00') {
                    // Append opacity only if it's not FF
                    hexValue = hexValue + opacityHex;
                }
            }
    
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
    
        showDialog(refElem) {
            if(!refElem.hasAttribute('data-color-picker')) {
                return;
            }

            this.referenceElement = refElem;
            const colorInput = refElem.querySelector('input');
            colorInput.disabled = true;

            this.color.hex = colorInput.value;
            this.setDefaultValues();

            const rect = refElem.getBoundingClientRect();
            this.colorPickerDialog.style.top = `${rect.bottom + 4}px`;
            this.colorPickerDialog.style.left = rect.left + 'px';
            this.colorPickerDialog.style.display = 'flex';

        }
    }

    global.colorPicker = new ColorPicker();

})(window)
