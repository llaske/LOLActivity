
// Main app class
enyo.kind({
	name: "LOLGameApp",
	kind: enyo.Control,
	published: {size: 13},	
	components: [
		{classes: "upper-bar", components: [
			{kind: "onyx.RadioGroup", classes: "level", components: [
				{name: "easy", content: "Easy", active: true},
				{name: "medium", content: "Medium"},
				{name: "hard", content: "Hard"}
			]},
			{kind: "onyx.RadioGroup", classes: "player", components: [
				{name: "player", disabled: true, content: "Player", active: true},
				{name: "computer", disabled: true, content: "Computer"}
			]},
			{kind: "onyx.Button", name: "switchplayer", classes: "switch", content: "Switch player", ontap: "switchPlayer"}
		]},
		{name: "box", classes: "lol-box", components: [
		]},
		{kind: "onyx.Button", classes: "play", content: "Play", ontap: "doPlay"},
		{kind: "onyx.Button", name: "renew", classes: "renew", showing: false, content: "Restart", ontap: "doRenew"},
		{name: "endmessage", showing: false, classes: "end-message"}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.init();
	},
	
	// Init game
	init: function() {
		// Init game context
		this.game = new LOLGame(this.size);
		this.selectedCount = 0;
		this.player = this.game.getPlayer();
		
		// Draw board
		this.drawBoard();
	},
	
	// Redraw the board
	drawBoard: function() {
		// Clean board
		this.selectedCount = 0;
		var items = [];
		enyo.forEach(this.$.box.getControls(), function(item) {
			items.push(item);
		});		
		for (var i = 0 ; i < items.length ; i++) {
			items[i].destroy();
		}
		
		// Redraw board
		for (var i = 0 ; i < this.game.getLength() ; i++) {
			this.$.box.createComponent(
				{ kind: "LOLItem", ontap: "selectItem" },
				{ owner: this }
			).render();
		}
		this.$.switchplayer.setDisabled(this.game.getLength() != this.size);
		this.$.player.setActive(this.player == this.game.getPlayer());
		this.$.computer.setActive(this.player != this.game.getPlayer());
		this.$.renew.setShowing(this.game.endOfGame());
		
		// Test end condition
		if (this.game.endOfGame()) {
			this.$.endmessage.setContent(this.game.getPlayer() != this.player ? ":-)" : ":-(");
			this.addClass(this.game.getPlayer() != this.player ? "end-message-win" : "end-message-lost");
			this.removeClass(this.game.getPlayer() != this.player ? "end-message-lost" : "end-message-win");			
		}
		this.$.endmessage.setShowing(this.game.endOfGame());		
		
		// Play for computer
		if (this.game.getPlayer() != this.player)
			this.computerPlay();
	},
	
	// Get current level
	getLevel: function() {
		if (this.$.easy.getActive())
			return 1;
		if (this.$.medium.getActive())
			return 2;
		if (this.$.hard.getActive())
			return 3;	
		return 0;
	},
	
	// Select an item
	selectItem: function(item) {
		if (this.player != this.game.getPlayer())
			return;
		var value = item.getSelected();
		if (this.selectedCount == 3 && !value)
			return;
		this.selectedCount = !value ? this.selectedCount + 1 : this.selectedCount - 1;
		item.setSelected(!value);
	},
	
	// Switch player
	switchPlayer: function() {
		this.game.reverse();
		this.player = this.player % 2;
		this.drawBoard();
	},
	
	// Play for the player
	doPlay: function() {
		if (this.player != this.game.getPlayer())
			return;
		if (this.selectedCount == 0)
			return;	
		this.game.play(this.selectedCount);
		this.drawBoard();
	},
	
	// Let's computer play
	computerPlay: function() {
		if (this.player == this.game.getPlayer())
			return;
		this.selectedCount = 0;
		this.step = 0;
		this.timer = window.setInterval(enyo.bind(this, "doComputer"), 400+50*this.getLevel());
	},
	
	// Play for the computer
	doComputer: function() {
		// First, think to the shot and select item
		if (this.step == 0) {
			this.step++;
			var shot = this.game.think(this.getLevel());
			var context = this;
			enyo.forEach(this.$.box.getControls(), function(item) {
				if (context.selectedCount < shot) {
					item.setSelected(true);
					context.selectedCount++;
				}
			});
			this.step++;
		}
		
		// Then play
		else if (this.step == 2) {
			window.clearInterval(this.timer);
			this.game.play(this.selectedCount);			
			this.drawBoard();
		}
	},
	
	// Start a new game
	doRenew: function() {
		this.init();
	}
});


// Class for an item
enyo.kind({
	name: "LOLItem",
	kind: enyo.Control,
	classes: "lol-item",
	published: { selected: false },
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.selectedChanged();
	},
	
	// Selection changed
	selectedChanged: function() {
		var className = "lol-item-selected";
		if (this.selected)
			this.addClass(className);
		else
			this.removeClass(className);
	},	
});