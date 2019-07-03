#!/usr/bin/env python3

import argparse
from math import floor
import os
import sys
import json

from typing import Dict, List, Tuple

# from pysvg.shape import Circle, Path, Rect, Polygon  # Line, Polyline
# from pysvg.structure import G, Svg
# from pysvg.text import Text

import cadnano
from cadnano.document import Document

import numpy as np

DEFAULT_SLICE_SCALE = 10
DEFAULT_PATH_SCALE = 10


class CadnanoDocument(object):
    """
    Opens and Parses a Cadnano file. Provides accessors for cadnano design
    parameters needed for SVG conversion.
    """
    def __init__(self, cnjsonpath: str) -> None:
        super(CadnanoDocument, self).__init__()
        self.cnjsonpath = cnjsonpath

        app = cadnano.app()
        doc = app.document = Document()
        doc.readFile(cnjsonpath)
        self.part = part = doc.activePart()
        self.part_props = part_props = part.getModelProperties().copy()
        self.vh_order = part_props['virtual_helix_order']
        self.vh_props, self.vh_origins = part.helixPropertiesAndOrigins()
        self.vh_radius = part.radius()
        self.max_vhelix_length = max(self.vh_props['length'])

        # Determine part coordinate boundaries
        xLL, yLL, xUR, yUR = part.getVirtualHelixOriginLimits()
        # print(xLL, yLL, xUR, yUR)
        self.slice_width = xUR-xLL + self.vh_radius * 8
        self.slice_height = yUR-yLL + self.vh_radius * 6
        self.x_offset = self.slice_width/2
        self.y_offset = self.slice_height/2
    # end def

    def getSliceDimensions(self) -> Tuple:
        return self.slice_width, self.slice_height
    # end def

    def getOligoList(self) -> List:
        oligo_list = []
        for oligo in self.part.oligos():
            color = oligo.getColor()
            name = oligo.getName()
            strands = []
            strand5p = oligo.strand5p()
            for s in strand5p.generator3pStrand():
                strands.append([s.idNum(), s.idx5Prime(), s.idx3Prime(), s.isForward()])
            oligo_list.append([name, color, strands])
        return oligo_list
    # end def

    def getOligoEndpointsList(self):
        ends5p = []
        ends3p = []
        for oligo in self.part.oligos():
            if not oligo.isCircular():
                color = oligo.getColor()
                strand5p = oligo.strand5p()
                idnum5p = strand5p.idNum()
                idx5p = strand5p.idx5Prime()
                isfwd5p = strand5p.isForward()
                ends5p.append([color, idnum5p, idx5p, isfwd5p])
                strand3p = oligo.strand3p()
                idnum3p = strand3p.idNum()
                idx3p = strand3p.idx3Prime()
                isfwd3p = strand3p.isForward()
                ends3p.append([color, idnum3p, idx3p, isfwd3p])
        return ends5p, ends3p
    # end def

    def insertions(self):
        pass
    # end def

    def skips(self):
        pass
    # end def
# end class


class CadnanoThreeJs(object):
    """
    Generate 3d coordinate data for the Cadnano document cn_doc.
    """
    PATH_X_PADDING = 40
    PATH_Y_PADDING = 40

    def __init__(self, cn_doc, output_path, viewer_path, scale=DEFAULT_PATH_SCALE):
        super(CadnanoThreeJs, self).__init__()
        self.cn_doc = cn_doc
        self.output_path = output_path
        self._scale = scale
        self._path_radius_scaled = cn_doc.vh_radius*scale
        self._path_vh_fontsize = floor(2*self._path_radius_scaled*0.75)
        self._path_vh_margin = self._path_radius_scaled*5
        self._base_width = self.base_height = self._path_radius_scaled

        self.coords = self.mapIdnumsToCoords()
        oligo_coords = self.getOligoCoords()

        with open(output_path, 'w') as outfile:
            outfile.write(json.dumps(oligo_coords))
        # with open(viewer_path, 'w') as viewerfile:
        #     viewerfile.write('var DATA = ' + json.dumps(oligo_coords)+ ';')
    # end def

    def getOligoCoords(self):
        result = []
        oligo_list = self.cn_doc.getOligoList()
        i = 0
        for _, color, strands in oligo_list:
            oligo_coords = []
            name = "oligo%03d" % i
            for idNum, idx5Prime, idx3Prime, isForward in strands:
                axis = self.coords[idNum]['axis']
                if isForward:
                    # pts = self.coords[idNum]['fwd']
                    # strand_coords = pts[idx5Prime:idx3Prime]
                    pts = self.coords[idNum]['fwd']
                    midpts = [[round((pts[i][0]+axis[i][0])/2, 6),
                               round((pts[i][1]+axis[i][1])/2, 6),
                               round((pts[i][2]+axis[i][2])/2, 6)] for i in range(len(pts))]
                    strand_coords = midpts[idx5Prime:idx3Prime]
                else:
                    # pts = self.coords[idNum]['rev']
                    # strand_coords = pts[idx5Prime:idx3Prime:-1]
                    pts = self.coords[idNum]['rev']
                    midpts = [[round((pts[i][0]+axis[i][0])/2, 6),
                               round((pts[i][1]+axis[i][1])/2, 6),
                               round((pts[i][2]+axis[i][2])/2, 6)] for i in range(len(pts))]
                    strand_coords = midpts[idx5Prime:idx3Prime:-1]
                oligo_coords.extend(strand_coords)
            d = {'name': name, 'color': color, 'coords': oligo_coords}
            if i == 0:
                print("\nFirst oligo:")
                print(name, color, oligo_coords)
            i += 1
            result.append(d)
        return result

    def mapIdnumsToCoords(self) -> Dict:
        d = {}
        for i in range(len(self.cn_doc.vh_order)):
            id_num = self.cn_doc.vh_order[i]
            axis_pts, fwd_pts, rev_pts = self.cn_doc.part.getCoordinates(id_num)
            d[id_num] = {'axis': np.round(axis_pts, 6).tolist(),
                         'fwd': np.round(fwd_pts, 6).tolist(),
                         'rev': np.round(rev_pts, 6).tolist()}
        return d
# end class


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--input', '-i', type=str, required=True, nargs=1, metavar='FILE', help='Cadnano JSON file')
    parser.add_argument('--output', '-o', type=str, nargs='?', metavar='DIR', help='Output directory')
    args = parser.parse_args()

    if args.input is None:
        parser.print_help()
        sys.exit('Input file not specified')

    design = args.input[0]
    if not design.endswith('.json'):
        parser.print_help()
        sys.exit('Input should be JSON file')

    output_directory = args.output

    basename = os.path.splitext(os.path.basename(design))[0]
    base_path = os.path.splitext(design)[0]
    cndoc = CadnanoDocument(design)
    if output_directory and os.path.exists(output_directory):
        output_file = os.path.join(output_directory, '%s_coords.json' % basename)
    else:
        output_file = '%s_coords.json' % base_path
    viewer_file = 'viewer/input.json'
    CadnanoThreeJs(cndoc, output_file, viewer_file)
# end def


if __name__ == "__main__":
    main()
