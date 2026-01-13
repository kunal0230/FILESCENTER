
let qpdfModule: any = null;
let isLoading = false;
let loaderPromise: Promise<any> | null = null;

export async function getQpdfModule() {
    if (qpdfModule) return qpdfModule;
    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise((resolve, reject) => {
        if (typeof (window as any).Module === 'function') {
            initModule((window as any).Module).then(resolve).catch(reject);
            return;
        }

        const script = document.createElement('script');
        script.src = '/qpdf.js';
        script.async = true;
        script.onload = () => {
            if (typeof (window as any).Module === 'function') {
                initModule((window as any).Module).then(resolve).catch(reject);
            } else {
                reject(new Error('QPDF Module factory not found after script load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load qpdf.js'));
        document.body.appendChild(script);
    });

    return loaderPromise;
}

async function initModule(ModuleFactory: any) {
    return new Promise((resolve) => {
        const instance = ModuleFactory({
            locateFile: (path: string) => {
                if (path.endsWith('.wasm')) return '/qpdf.wasm';
                return path;
            },
            onRuntimeInitialized: () => {
                qpdfModule = instance;
                resolve(instance);
            }
        });
        if (instance instanceof Promise) {
            instance.then((mod: any) => {
                qpdfModule = mod;
                resolve(mod);
            });
        }
    });
}

export async function compressPDFLossless(file: File): Promise<Blob> {
    const qpdf = await getQpdfModule();
    const arrayBuffer = await file.arrayBuffer();
    const inputData = new Uint8Array(arrayBuffer);

    const inputFileName = `input_${Date.now()}.pdf`;
    const outputFileName = `output_${Date.now()}.pdf`;

    try {
        qpdf.FS.writeFile(inputFileName, inputData);

        // Optimal structural compression flags
        const args = [
            '--stream-data=compress',
            '--object-streams=generate',
            inputFileName,
            outputFileName
        ];

        console.log('Running QPDF Lossless Optimization:', args);
        const exitCode = qpdf.callMain(args);

        if (exitCode === 0) {
            const outputData = qpdf.FS.readFile(outputFileName);

            // Safety: If it grew (rare), return original
            if (outputData.length >= inputData.length) {
                console.warn('Lossless optimization did not reduce size. Returning original.');
                return new Blob([inputData], { type: 'application/pdf' });
            }

            console.log(`Lossless finished: ${inputData.length} -> ${outputData.length}`);
            return new Blob([outputData], { type: 'application/pdf' });
        } else {
            throw new Error(`QPDF exited with code ${exitCode}`);
        }
    } finally {
        try {
            qpdf.FS.unlink(inputFileName);
            qpdf.FS.unlink(outputFileName);
        } catch (e) { }
    }
}
