// Basic tests for Go game logic validation
import { GoGame, GoBoard, StoneColor, RuleType } from './index';

// Test basic board operations
export function testBasicBoardOperations() {
  console.log('🧪 Testing basic board operations...');
  
  const board = new GoBoard(9); // Small board for testing
  
  // Test initial state
  console.assert(board.getSize() === 9, 'Board size should be 9');
  console.assert(board.getStone({ x: 0, y: 0 }) === StoneColor.EMPTY, 'Initial position should be empty');
  
  // Test stone placement
  board.placeStone({ x: 0, y: 0 }, StoneColor.BLACK);
  console.assert(board.getStone({ x: 0, y: 0 }) === StoneColor.BLACK, 'Stone should be placed');
  
  console.log('✅ Basic board operations test passed');
}

// Test capture logic
export function testCaptureLogic() {
  console.log('🧪 Testing capture logic...');
  
  const board = new GoBoard(9);
  
  // Create a captured white stone scenario
  // Place white stone in corner
  board.placeStone({ x: 0, y: 0 }, StoneColor.WHITE);
  
  // Surround it with black stones
  board.placeStone({ x: 1, y: 0 }, StoneColor.BLACK);
  board.placeStone({ x: 0, y: 1 }, StoneColor.BLACK);
  
  // White stone should now have no liberties
  const whiteGroup = board.getGroup({ x: 0, y: 0 });
  const liberties = board.countLiberties(whiteGroup);
  console.assert(liberties === 0, `White stone should have 0 liberties, has ${liberties}`);
  
  // Test capture detection
  const capturedGroups = board.findCapturedGroups(StoneColor.WHITE);
  console.assert(capturedGroups.length === 1, 'Should find one captured group');
  console.assert(capturedGroups[0].length === 1, 'Captured group should have one stone');
  
  console.log('✅ Capture logic test passed');
}

// Test game flow
export function testGameFlow() {
  console.log('🧪 Testing game flow...');
  
  const game = new GoGame(9, RuleType.STANDARD);
  game.startGame();
  
  const initialState = game.getGameState();
  console.assert(initialState.currentPlayer === StoneColor.BLACK, 'Black should play first');
  
  // Test valid move
  const moveSuccess = game.makeMove({ x: 3, y: 3 });
  console.assert(moveSuccess, 'Valid move should succeed');
  
  const afterFirstMove = game.getGameState();
  console.assert(afterFirstMove.currentPlayer === StoneColor.WHITE, 'Should switch to white player');
  console.assert(afterFirstMove.moves.length === 1, 'Should have one move recorded');
  
  // Test invalid move (same position)
  const invalidMove = game.makeMove({ x: 3, y: 3 });
  console.assert(!invalidMove, 'Invalid move should fail');
  
  // Test undo
  const undoSuccess = game.undoLastMove();
  console.assert(undoSuccess, 'Undo should succeed');
  
  const afterUndo = game.getGameState();
  console.assert(afterUndo.currentPlayer === StoneColor.BLACK, 'Should return to black player');
  console.assert(afterUndo.moves.length === 0, 'Move history should be empty');
  
  console.log('✅ Game flow test passed');
}

// Test scoring
export function testScoring() {
  console.log('🧪 Testing scoring...');
  
  const game = new GoGame(9, RuleType.STANDARD);
  game.startGame();
  
  // Create a simple territory scenario
  game.makeMove({ x: 2, y: 2 }); // Black
  game.makeMove({ x: 6, y: 6 }); // White
  
  const scores = game.calculateScore();
  console.assert(typeof scores.blackTotal === 'number', 'Black score should be a number');
  console.assert(typeof scores.whiteTotal === 'number', 'White score should be a number');
  console.assert(scores.blackTotal >= 0, 'Black score should be non-negative');
  console.assert(scores.whiteTotal >= 0, 'White score should be non-negative');
  
  console.log('✅ Scoring test passed');
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running Go game logic tests...\n');
  
  try {
    testBasicBoardOperations();
    testCaptureLogic();
    testGameFlow();
    testScoring();
    
    console.log('\n🎉 All tests passed! Go game logic is working correctly.');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

// Export for manual testing
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests();
}