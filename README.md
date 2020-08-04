# cn2threejs - Cadnano 3D coordinate exporter

cn2threejs reads in a cadnano json file and writes a coordinate json file.

## Installation (virtualenv)

```
mkvirtualenv myvenv
pip3 install PyQt5 pandas termcolor git+https://github.com/douglaslab/cadnano2.5
```

## Installation (future, doesn't work yet)

`pip3 install cn2threejs`

## Example Usage

`cn2threejs -i cadnanofile.json -o outputdir`

This should output two files: `cadnanofile_coords.json` and `viewer/input.json`.
The second file is read as input by `viewer/index.html`.

## Dependencies

- [cadnano2.5](https://github.com/douglaslab/cadnano2.5)

## Citing

If you publish research using `cn2threejs`, please cite [placeholder](#).
