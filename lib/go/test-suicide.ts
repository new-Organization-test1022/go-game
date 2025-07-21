import { GoBoard, StoneColor } from './index';

console.log('🚀 Testing suicide detection...');

// Create a board with a clear suicide situation
const board = new GoBoard(9);

// Create this pattern:  ⚫⚪ 
//                      ⚪●⚪ where ● is empty and would be suicide for Black
//                       ⚪
// (0,0) will be surrounded by White stones

// Place White stones around (0,0)
board.placeStone({ x: 1, y: 0 }, StoneColor.WHITE); // Right
board.placeStone({ x: 0, y: 1 }, StoneColor.WHITE); // Down

console.log('Board state:');
for (let y = 0; y < 3; y++) {
  let row = '';
  for (let x = 0; x < 3; x++) {
    const stone = board.getStone({ x, y });
    if (stone === StoneColor.BLACK) row += '⚫';
    else if (stone === StoneColor.WHITE) row += '⚪';
    else row += '·';
  }
  console.log(row);
}

// Test if placing Black at (0,0) is legal (should be false - suicide)
const suicideMove = { x: 0, y: 0 };
const isLegal = board.isLegalMove(suicideMove, StoneColor.BLACK);
console.log(`\nBlack at (0,0) is legal: ${isLegal}`);

// Let's also check liberties directly
board.placeStone(suicideMove, StoneColor.BLACK);
const group = board.getGroup(suicideMove);
const liberties = board.countLiberties(group);
console.log(`If placed, Black stone would have ${liberties} liberties`);

console.log('\n✅ Suicide detection test completed!');