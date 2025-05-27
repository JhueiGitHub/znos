import * as THREE from "three";
import { CardTextureManager } from "./textureManager";

export class Player {
    public cards: THREE.Mesh[];
    public money: number;
    public turnbalance: number;
    public cardsvalues: [number, number];

    constructor() {
        this.cards = [];
        this.cardsvalues = [0, 0];
        this.money = 1000;
        this.turnbalance = 0;
    }
}

export function findBoneByName(object: THREE.Object3D, boneName: string): THREE.Bone | null {
    if (object instanceof THREE.Bone) {
        if (object.name === boneName) {
            return object as THREE.Bone;
        }
    }

    for (const child of object.children) {
        const foundBone = findBoneByName(child, boneName);
        if (foundBone) {
            return foundBone;
        }
    }

    return null;
}

export class LocalPlayer extends Player {
    public body: THREE.Object3D;
    public cardsValToMesh: Map<number, THREE.Mesh>;
    public update: () => void;

    constructor(camera: THREE.Camera) {
        super();
        this.update = () => {};
        this.body = new THREE.Object3D();
        this.cardsValToMesh = new Map();
        this.body.scale.multiplyScalar(0.01);
        this.body.rotateX(Math.PI / 2);
        this.body.rotateY(Math.PI);
        this.body.position.copy(camera.position).add(new THREE.Vector3(0, -0.1, -3));
    }

    add(scene: THREE.Scene) {
        scene.add(this.body);
        return this;
    }
}

export class OnlinePlayer extends Player {
    public body: THREE.Object3D;
    public name: string;
    public static textureManager: CardTextureManager;
    public static playerBody: THREE.Object3D;
    public static font: any;
    public myturn: boolean;
    public update: (camera: THREE.Camera) => void;
    public fontMesh: THREE.Mesh;
    public order: number;
    public static Best: OnlinePlayer | null = null;

    constructor(name: string, order: number) {
        super();
        this.update = () => {};
        this.order = order;
        this.name = name;
        this.body = new THREE.Object3D();
        this.body.scale.multiplyScalar(0.013);
        this.body.rotateX(Math.PI / 2);
        this.myturn = false;
        this.fontMesh = new THREE.Mesh();
        this.cards = [];
    }

    startCards(scene: THREE.Scene) {
        function createMesh() {
            const texture = OnlinePlayer.textureManager.enemy();
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                shininess: 10,
                map: texture,
            });
            return new THREE.Mesh(new THREE.BoxGeometry(0.58 / 2, 0.78 / 2, 0.0), material);
        }
        this.cards.push(...[createMesh(), createMesh()]);
        for (const xmesh of this.cards) {
            xmesh.scale.set(2, 2, 2);
            scene.add(xmesh);
        }
    }

    add(scene: THREE.Scene) {
        scene.add(this.body);
        scene.add(this.fontMesh);
    }

    position(position: THREE.Vector3, lookAt: THREE.Vector3) {
        const yRotation = Math.atan2(lookAt.x - position.x, lookAt.z - position.z);
        this.body.rotation.y = yRotation;
        this.body.position.copy(position);

        for (const [index, card] of this.cards.entries()) {
            card.rotation.z = (index * 2 - 1) / 10;
            card.rotation.x = Math.PI;
            card.rotation.y = yRotation;
        }
        this.fontMesh.position
            .copy(this.body.position)
            .add(new THREE.Vector3(0, 0, 5.3))
            .add(new THREE.Vector3(-1, 0, 0).applyQuaternion(this.body.quaternion).multiplyScalar(this.name.length / 15));
        this.fontMesh.scale.set(0.04, 0.04, 0.00001);
    }

    handleLook(x: number, y: number) {
        const bone = findBoneByName(this.body, "mixamorigHead");
        if (!bone) return;

        const xRotation = new THREE.Vector2();
        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
        const multiplyer = (0.5 - clamp(y - 0.5, 0, 0.5)) * 2;
        xRotation.y = Math.PI - ((clamp(1 - y, 0.5, 0.75) + 1) / 2) * Math.PI;
        xRotation.x = (x - 0.5) * multiplyer;
        bone.quaternion.setFromEuler(new THREE.Euler(xRotation.y, 0, 0));
        bone.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), xRotation.x);
    }

    dispose(scene: THREE.Scene) {
        for (const xmesh of this.cards) {
            scene.remove(xmesh);
        }
        scene.remove(this.body);
    }
}
