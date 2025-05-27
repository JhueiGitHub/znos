import * as THREE from "three";

export class CardTextureManager {
    private readonly x = 7.5;
    private ValueCords(value: number, shape: number): { startX: number; startY: number; endX: number; endY: number } {
        let startX = 4;
        let startY = shape < 2 ? 760 : 824;
        startX += (value - 1) * 53 + (value == 11 ? 1 : value == 12 ? -2 : 0) * 4;
        let endX = startX + 50 + (value == 11 ? 1 : 0) * -10;
        let endY = startY + 50;
        return { startX, startY, endX, endY };
    }

    private ShapeCords(value: number, shape: number): { startX: number; startY: number; endX: number; endY: number } {
        let startX = 2;
        let startY = 260;
        startX = shape * 147;
        let endX = startX + 133;
        let endY = startY + 130;
        return { startX, startY, endX, endY };
    }

    private generateCardTexture(value: number, shape: number): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            const valueSymbolCoordinates = this.ValueCords(value, shape);
            const shapeSymbolCoordinates = this.ShapeCords(value, shape);
            const valueSymbolTexture = this.extractTextureRegion(this.main, valueSymbolCoordinates);
            const shapeSymbolTexture = this.extractTextureRegion(this.main, shapeSymbolCoordinates);

            const canvas = document.createElement("canvas");
            canvas.width = 58 * 4;
            canvas.height = 78 * 4;
            const context = canvas.getContext("2d");

            if (context === null) throw Error("context isnt 2d");

            Promise.all([valueSymbolTexture.image.onload, shapeSymbolTexture.image.onload])
                .then(() => {
                    context.fillStyle = "white";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = shape < 2 ? "#bb2026" : "#141624";
                    context.fillRect(this.x, this.x, canvas.width - this.x * 2, canvas.height - this.x * 2);
                    context.fillStyle = shape < 2 ? "#ef5050" : "#2f3a58";
                    context.fillRect(canvas.width / 2, this.x, canvas.width / 2 - this.x * 2, canvas.height - this.x * 2);
                    context.fillStyle = "white";
                    context.fillRect(this.x * 2, this.x * 2, canvas.width - this.x * 4, canvas.height - this.x * 4);
                    context.drawImage(shapeSymbolTexture.image, 50, 75);
                    context.drawImage(valueSymbolTexture.image, 50 + 133 / 2 - 53 / 2, 125 + 133 / 2 + 50 / 2);
                    const finalTexture = new THREE.CanvasTexture(canvas);
                    resolve(finalTexture);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private generateEmptyTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 58 * 4;
        canvas.height = 78 * 4;
        const context = canvas.getContext("2d");
        if (context === null) throw Error("context isnt 2d");
        context.fillStyle = "#4fba5a";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#2da345";
        context.fillRect(this.x, this.x, canvas.width - this.x * 2, canvas.height - this.x * 2);
        const finalTexture = new THREE.CanvasTexture(canvas);
        return finalTexture;
    }

    private extractTextureRegion(
        texture: THREE.Texture,
        { endX, endY, startX, startY }: { startX: number; startY: number; endX: number; endY: number }
    ): THREE.Texture {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context === null) throw Error("context isnt 2d");
        canvas.width = endX - startX;
        canvas.height = endY - startY;
        context.drawImage(texture.image, -startX, -startY);
        const extractedTexture = new THREE.CanvasTexture(canvas);
        return extractedTexture;
    }

    private map: Map<number, THREE.Texture> = new Map();
    
    public async card(value: number, shape: number): Promise<THREE.Texture> {
        const key = shape * 100 + value;
        let texture: THREE.Texture;
        if (this.map.has(key)) texture = this.map.get(key) as THREE.Texture;
        else {
            texture = await this.generateCardTexture(value, shape);
            this.map.set(key, texture);
        }
        return texture;
    }

    public enemy() {
        return this.generateEmptyTexture();
    }

    private main: THREE.Texture;
    constructor(main: THREE.Texture) {
        this.main = main;
    }
}
