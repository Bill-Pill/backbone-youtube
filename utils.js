/////////////////
//    MODELS   //
/////////////////

// APPMODEL //
const AppModel = Backbone.Model.extend({
  defaults: function () {
    return {
      videos: new VideosCollection()
    }
  }
})

// VIDEOMODEL //
const VideoModel = Backbone.Model.extend({
  defaults: function () {
    return {
      id: '',
      title: '',
      description: '',
      thumbnail: ''
    }
  }
})

/////////////////
// COLLECTIONS //
/////////////////

// VIDEOSCOLLECTION //
const VideosCollection = Backbone.Collection.extend({
  url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=drifting&type=video&videoEmbeddable=true&key=AIzaSyCu1okWlNecCAAqGlLnb6MUdaqd8XZVxbU',
  model: VideoModel,

  parse: function (response) {
    // Edge case for 0 results
    if (response.items.length === 0) {
      alert("Query returned 0 results - please try again")
    }
    return response.items.map(function (item) {
      videoObj = {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url
      };
      return videoObj;
    })
  },

  queryVideo: function (searchInput) {
    this.reset()
    this.url = `https://www.googleapis.com/youtube/v3/search?q=${searchInput}&part=snippet&type=video&videoEmbeddable=true&key=AIzaSyCu1okWlNecCAAqGlLnb6MUdaqd8XZVxbU`
    this.fetch()
  },

  setNewCurrentVideo: function (clickedVideoID) {
    const clickedModel = this.findWhere({
      id: clickedVideoID
    })
    this.reset()
    this.add(clickedModel)
    this.fetchRelatedVideos(clickedVideoID)
  },

  fetchRelatedVideos: function (relatedToId) {
    this.url = `https://www.googleapis.com/youtube/v3/search?relatedToVideoId=${relatedToId}&part=snippet&type=video&videoEmbeddable=true&key=AIzaSyCu1okWlNecCAAqGlLnb6MUdaqd8XZVxbU`
    this.fetch({
      remove: false,
    })
  }
})

/////////////////
//    VIEWS    //
/////////////////

// APPVIEW //
const AppView = Backbone.View.extend({
  el: $('body'),

  initialize: function () {
    this.listenTo(this.model.get('videos'), 'update', this.renderCurrentVideo);
    this.listenTo(this.model.get('videos'), 'update', this.renderRelatedVideos);
  },

  events: {
    'click #search-button': 'searchVideo',
    'click .watch-video': 'watchRelatedVideo',
    'keypress #search-input': 'searchOnEnter'
  },

  searchOnEnter: function (e) {
    if (e.which === 13) {
      this.searchVideo()
    }
  },

  searchVideo: function () {
    const input = this.$('#search-input').val()
    // edge case for empty search
    if (!input) {
      alert("Please enter a query!")
      return;
    }
    this.model.get('videos').queryVideo(input);
  },

  watchRelatedVideo: function (e) {
    const clickedVideoID = $(e.currentTarget).data().id;
    this.model.get('videos').setNewCurrentVideo(clickedVideoID)

  },

  renderCurrentVideo: function () {
    const currentVideo = this.model.get('videos').first()
    const currentVideoView = new CurrentVideoView({
      model: currentVideo
    });
    this.$('#current-video').empty().append(currentVideoView.render().el)
  },

  renderRelatedVideos: function () {
    this.$('#related-video-container').empty()

    const relatedVideos = this.model.get('videos').rest(1)
    relatedVideos.forEach(function (relatedVideo) {
      const relatedVideoView = new RelatedVideoView({
        model: relatedVideo
      })
      this.$('#related-video-container').append(relatedVideoView.render().el)
    })
  }
})


// CURRENTVIDEOVIEW //
const CurrentVideoView = Backbone.View.extend({
  template: Handlebars.compile($('#current-video-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));

    return this;
  }
})

// RELATEDVIDEOVIEW //
const RelatedVideoView = Backbone.View.extend({
  className: 'small-video',
  template: Handlebars.compile($('#related-video-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));

    return this;
  }

})