/**
 * Adapted from the source found here:
 * http://cdnjs.cloudflare.com/ajax/libs/mathjs/3.9.0/math.js
 *
 * math.js
 * https://github.com/josdejong/mathjs
 *
 * Math.js is an extensive math library for JavaScript and Node.js,
 * It features real and complex numbers, units, matrices, a large set of
 * mathematical functions, and a flexible expression parser.
 *
 * @version 3.9.0
 * @date    2017-01-23
 *
 * @license
 * Copyright (C) 2013-2016 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

function _compute_mu (matrix) {
  var i, j;

  // Compute the matrix with zero lower triangle, same upper triangle,
  // and diagonals given by the negated sum of the below diagonal
  // elements.
  var mu = new Array(matrix.rows);
  var sum = 0;
  for (i = 1; i < matrix.rows; i++) {
    sum += matrix.array[i][i];
  }

  for (i = 0; i < matrix.rows; i++) {
    mu[i] = new Array(matrix.rows);
    mu[i][i] = -sum;

    for (j = 0; j < i; j++) {
      mu[i][j] = 0; // TODO: make bignumber 0 in case of bignumber computation
    }

    for (j = i + 1; j < matrix.rows; j++) {
      mu[i][j] = matrix.array[i][j];
    }

    if (i+1 < matrix.rows) {
      sum -= matrix.array[i + 1][i + 1];
    }
  }

  return { rows: matrix.rows, columns: matrix.columns, array: mu };
};

function determinant (matrix) {
  if (matrix.rows !== matrix.columns) {
    error("determinant doesn't exist for rows != columns");
    return 0;
  }
  switch (matrix.rows) {
    case 0:
      return 0;
    case 1:
      return matrix.array[0][0];
    case 2:
      // this is a 2 x 2 matrix
      // the determinant of [a11,a12;a21,a22] is det = a11*a22-a21*a12
      return matrix.array[0][0]*matrix.array[1][1] - matrix.array[0][1]*matrix.array[1][0];
  }

  var fa = matrix;
  for (var i = 0; i < matrix.rows - 1; i++) {
    var new_matrix = {};
    matrix_multiply(new_matrix, _compute_mu(fa), matrix);
    fa = new_matrix;
  }

  if (matrix.rows % 2 == 0) {
    return -fa.array[0][0];
  } else {
    return fa.array[0][0];
  }
}
