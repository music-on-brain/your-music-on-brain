let allcells = [];
let history = [];
let canvasdim = document.getElementById("song-vis").offsetWidth;
let numsquares = 10;

function setup() {

  const cnv = createCanvas(canvasdim, canvasdim);
  cnv.parent('song-vis');
  
  for(let r = 0; r < numsquares; r++){
    allcells[r] = [];
    for (let c = 0; c < numsquares; c++){
      allcells[r][c] = new cell(r, c, numsquares, canvasdim);
    }
  }
}

function draw(){  
  clear();
  
  for (let i = 0; i < numsquares; i++){
    for (let j = 0; j < numsquares; j++){
      let highlight = i == attributes.valence && j == attributes.energy;
      allcells[i][j].printcell(highlight);
      if(allcells[i][j].activated_){
        allcells[i][j].emanate(highlight);
      }
      
    }
  }
  
  // let mouseXaccess = floor(mouseX * 10 / 400 - 0.5);
  // let mouseYaccess = floor(mouseY * 10 / 400 - 0.5);
  
  // if(mouseXaccess >= 0 && mouseXaccess < numsquares && mouseYaccess > 0 && mouseYaccess < numsquares){
  //   allcells[mouseXaccess][mouseYaccess].toggleon();
  // }
}

class cell {
  constructor(row, col, cellstotal, canvasdim){
    this.celldim_ = canvasdim/cellstotal;
    this.r_ = row * this.celldim_;
    this.c_ = col * this.celldim_;
    this.centerx_ = this.r_ + (this.celldim_/2);
    this.centery_ = this.c_ + (this.celldim_/2);
    this.basecolor_ = 0;
    this.activated_ = false;
    
    this.smallcircle_ = [];
    this.bigcircle_ = [];
    this.morph_ = [];
    this.emstate_ = false;
    
    
    //Colors of Cells (lines 48 - __)
    if (row < cellstotal/2){
      this.red_ = 146 + (row * (236-146)/(floor(cellstotal/2)));
      this.green_ = 12 + (row * (52-12)/(floor(cellstotal/2)));
      this.blue_ = 158 + (row * (52-158)/(floor(cellstotal/2)));      
    }
    else if (row == cellstotal/2){
      this.red_ = 236;
      this.green_ = 52;
      this.blue_ = 52;
    }
    else if (row > cellstotal/2){
      this.red_ = 236 + ((row-cellstotal/2) * (255-236)/(floor(cellstotal/2)));
      this.green_ = 52 + ((row-cellstotal/2) * (250-52)/(floor(cellstotal/2)));
      this.blue_ = 52 + ((row-cellstotal/2) * (147-52)/(floor(cellstotal/2)));      
    }
        
    for (let angle = 0; angle < 360; angle += 30){
      let va = p5.Vector.fromAngle(radians(angle-135), 10);
      let vb = p5.Vector.fromAngle(radians(angle-135), 20);
      this.smallcircle_.push(va);
      this.bigcircle_.push(vb);
      this.morph_.push(createVector());
    }  
  }
  
  printcell(highlight){
    if (highlight) this.activated_ = true;
    stroke(this.red_, this.green_, this.blue_);
    if (this.activated_){
        fill(this.red_, this.green_, this.blue_);     
    }
    else{
      noFill();
    }
    let radmult = highlight ? 2 : .5;
    ellipse(this.centerx_, this.centery_, this.celldim_/2 * radmult, this.celldim_/2 * radmult);
  }
  
  toggleon(){
      this.activated_ = true;
      history.push(this);
  }

  emanate(highlight){
    /* CURRENT MEMBERS
    this.smallcircle_ = [];
    this.bigcircle_ = [];
    this.morph_ = [];
    this.emstate_ = false;
    */
    
    push();
    let totalDistance = 0;
    
    for(let i = 0; i < this.smallcircle_.length; i++){
      let v1;
      
      if(this.emstate_){
        v1 = this.smallcircle_[i];
      }
      else{
        v1 = this.bigcircle_[i];
      }
      
      let v2 = this.morph_[i];
      v2.lerp(v1, 0.1);
      
      totalDistance += p5.Vector.dist(v1, v2);
      
      if (totalDistance < 0.1){
        this.emstate_ = !this.emstate_;
      }
    }
    
    translate(this.centerx_, this.centery_);
    strokeWeight(1);
    // Draw a polygon that makes up all the vertices
    beginShape();
    noFill();
    stroke(this.red_, this.green_, this.blue_);

    this.morph_.forEach(v => {
      vertex(v.x, v.y);
    });
    endShape(CLOSE);
    pop();    
  }
}